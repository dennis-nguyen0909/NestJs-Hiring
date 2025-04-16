/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CV } from './schema/CV.schema';
import aqp from 'api-query-params';
import { DeleteCvDto } from './dto/delete-cv.dto';
import * as PDFDocument from 'pdfkit';
import { User } from '../users/schemas/user.schema';
import { Project } from '../project/schema/project.schema';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { cloudinaryPublicIdRegexNew, cvPublicIdRegex } from 'src/helpers/util';
import { ICvService } from './cv.interface';
import { Meta } from '../types';
import { LogService } from 'src/log/log.service';
import { Request } from 'express';
@Injectable()
export class CvService implements ICvService {
  constructor(
    @InjectModel('CV') private cvRepository: Model<CV>,
    @InjectModel(User.name) private userModel: Model<User>,
    private cloudinaryService: CloudinaryService,
    private logService: LogService,
  ) {}
  async create(createCvDto: CreateCvDto, req: Request): Promise<CV> {
    const session = await this.cvRepository.startSession(); // Start session
    session.startTransaction(); // Start transaction

    try {
      const cvArray: CV[] = await this.cvRepository.create([createCvDto], {
        session,
      }); // Create CV in session
      const cv: CV = cvArray[0]; // Extract the first CV from the array

      const user: User = await this.userModel
        .findOne({ _id: createCvDto.user_id })
        .session(session); // Find user in session

      if (!user) {
        throw new BadRequestException('User not found');
      }

      if (!cv) {
        throw new BadRequestException('CV not created');
      }

      user.cvs.push(cv._id as any);
      await user.save({ session }); // Save user changes within the session

      // Create log entry
      await this.logService.createLog({
        userId: new Types.ObjectId(createCvDto?.user_id),
        userRole: 'CANDIDATE',
        action: 'UPLOAD_CV',
        entityId: cv._id.toString(),
        entityCollection: 'CV',
        description: 'Upload CV',
        entityName: createCvDto?.cv_name,
        activityDetail: 'upload_cv',
        req: req,
        changesLink: {
          link: cv.cv_link,
          name: cv.cv_name,
        },
      });

      await session.commitTransaction(); // Commit transaction
      return cv;
    } catch (error) {
      await session.abortTransaction(); // Rollback transaction on error
      throw new InternalServerErrorException(
        'Error occurred, transaction rolled back: ' + error.message,
      );
    } finally {
      session.endSession(); // Always end session
    }
  }

  async findAll(
    query: string,
    current: number,
    pageSize: number,
  ): Promise<{ items: CV[]; meta: Meta }> {
    const { filter, sort } = aqp(query);
    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;
    if (!current) current = 1;
    if (!pageSize) pageSize = 10;
    const defaultSort = '-createdAt';
    const sortOption = sort || defaultSort;
    const totalItems = (await this.cvRepository.find(filter)).length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (+current - 1) * pageSize;
    const result = await this.cvRepository
      .find(filter)
      .limit(pageSize)
      .skip(skip)
      .sort(sortOption as any);
    return {
      items: result,
      meta: {
        count: result.length,
        current_page: current,
        per_page: pageSize,
        total: totalItems,
        total_pages: totalPages,
      },
    };
  }

  async findOne(id: string): Promise<CV> {
    return await this.cvRepository.findById(id);
  }

  async update(
    id: string,
    updateCvDto: UpdateCvDto,
  ): Promise<{ message: string; data: CV }> {
    try {
      const cv = await this.cvRepository.findById(id);
      if (!cv) {
        throw new NotFoundException('CV not found');
      }

      // If cv_name is being updated and cv_link exists
      if (updateCvDto.cv_name && cv.cv_link) {
        const result = await this.cloudinaryService.renamePDF(
          cv.public_id,
          updateCvDto.cv_name,
          cv.user_id.toString(),
        );
        console.log('result', result);
        if (result.secure_url && result.public_id) {
          updateCvDto.cv_link = result.secure_url;
          updateCvDto.public_id = result.public_id;
        } else {
          throw new BadRequestException('Failed to rename PDF in Cloudinary');
        }
      }

      const updatedCv = await this.cvRepository.findByIdAndUpdate(
        id,
        updateCvDto,
        {
          new: true,
        },
      );

      return {
        message: 'Cv updated successfully',
        data: updatedCv,
      };
    } catch (error) {
      throw new NotFoundException(error);
    }
  }

  async remove(
    data: DeleteCvDto,
    userId: string,
    req: Request,
  ): Promise<{ message: string; data: any[] }> {
    const { ids } = data;

    // Tìm người dùng
    const user: User = await this.userModel.findOne({ _id: userId });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Kiểm tra `ids` có phải là mảng không và có phần tử không
    if (!Array.isArray(ids)) {
      throw new BadRequestException('Ids is not an array');
    }
    if (ids.length === 0) {
      throw new BadRequestException('Ids array is empty');
    }

    if (ids.length === 1) {
      const cv = await this.cvRepository.findOne({ _id: ids[0] });
      console.log('cv', cv);
      if (cv) {
        if (cv.cv_link) {
          const res = await this.cloudinaryService.deleteFileResourceType(
            cv.public_id,
            { resource_type: 'raw' },
          );
          if (res.result !== 'ok') {
            throw new BadRequestException('Deleted failed cloudinary');
          }
        }
        const res = await this.cvRepository.deleteOne({ _id: ids[0] });
        if (res.deletedCount > 0) {
          await this.userModel.updateOne(
            { _id: userId },
            { $pull: { cvs: ids[0] } },
          );
          await this.logService.createLog({
            userId: new Types.ObjectId(userId),
            userRole: 'CANDIDATE',
            action: 'DELETE_CV',
            entityId: cv._id.toString(),
            entityCollection: 'CV',
            description: 'Delete CV',
            entityName: cv.cv_name,
            activityDetail: 'activity_delete_cv',
            req: req,
          });
          return {
            message: 'CV deleted successfully',
            data: [],
          };
        } else {
          return {
            message: 'CV not found',
            data: [],
          };
        }
      } else {
        throw new BadRequestException('CV not found');
      }
    } else {
      // Xử lý xóa nhiều CV
      const cvs = await this.cvRepository.find({ _id: { $in: ids } }); // Tìm nhiều CV dựa trên danh sách `ids`
      if (cvs && cvs.length > 0) {
        for (const cv of cvs) {
          if (cv.cv_link) {
            const res = await this.cloudinaryService.deleteFileResourceType(
              cv.public_id,
              { resource_type: 'raw' },
            );
            if (res.result !== 'ok') {
              throw new BadRequestException('Deleted failed cloudinary');
            }
          }
        }
      }

      const res = await this.cvRepository.deleteMany({ _id: { $in: ids } });
      if (res.deletedCount > 0) {
        // Cập nhật người dùng để xóa nhiều `CV` trong danh sách
        await this.userModel.updateOne(
          { _id: userId },
          { $pull: { cvs: { $in: ids } } },
        );
        await this.logService.createLog({
          userId: new Types.ObjectId(userId),
          userRole: 'CANDIDATE',
          action: 'DELETE_CV',
          entityId: ids.toString(),
          entityCollection: 'CV',
          description: 'Delete CV',
          entityName: cvs[0].cv_name,
          activityDetail: 'activity_delete_cv',
          req: req,
        });
        return {
          message: 'CVs deleted successfully',
          data: [],
        };
      } else {
        return {
          message: 'No CVs found for deletion',
          data: [],
        };
      }
    }
  }

  async findCvByUserId(
    id: string,
    query: string,
    current: number,
    pageSize: number,
  ): Promise<{ data: { items: CV[]; meta: Meta } }> {
    const { filter, sort } = aqp(query);
    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;

    if (!current) current = 1;
    if (!pageSize) pageSize = 10;
    const totalItems = (await this.cvRepository.find({ user_id: id })).length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (+current - 1) * pageSize;
    const result = await this.cvRepository
      .find({ user_id: id })
      .limit(pageSize)
      .skip(skip)
      .sort(sort as any);
    return {
      data: {
        items: result,
        meta: {
          count: result.length,
          current_page: current,
          per_page: pageSize,
          total: totalItems,
          total_pages: totalPages,
        },
      },
    };
  }
  async generalPDF(id: string): Promise<any> {
    // Populate the 'projects' field when querying the user
    const user = await this.userModel
      .findById(id)
      .populate('projects')
      .select(['-password', '-code_id', '-code_expired'])
      .populate('role')
      .populate('education_ids')
      .populate('work_experience_ids')
      .populate('organization')
      .populate('skills')
      .populate('certificates')
      .populate('prizes')
      .populate('projects')
      .populate('courses')
      .exec();

    if (!user) {
      throw new Error('User not found');
    }

    // TypeScript expects user.projects to be an array of ObjectIds by default
    const projects: Project[] = user.projects as unknown as Project[];

    const pdfBuffer: Buffer = await new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'LETTER',
        bufferPages: true,
      });

      // Add Header
      doc
        .font('Helvetica-Bold')
        .fontSize(30)
        .text(user.full_name || 'Full Name', {
          align: 'center',
        })
        .moveDown()
        .fontSize(12)
        .text(`Email: ${user.email || 'N/A'}`, 100, 100)
        .text(`Phone: ${user.phone || 'N/A'}`, 100, 120)
        .text(`Address: ${user.address || 'N/A'}`, 100, 140)
        .text(`Role: ${user.role?.role_name || 'N/A'}`, 100, 160)
        .moveDown();

      // Education Section
      doc
        .font('Helvetica-Bold')
        .fontSize(16)
        .text('Education', 100, doc.y)
        .moveDown()
        .fontSize(12);
      user.education_ids.forEach((education: any) => {
        doc
          .text(`School: ${education.school || 'N/A'}`)
          .text(`Major: ${education.major || 'N/A'}`)
          .text(
            `Start Date: ${new Date(education.start_date).toLocaleDateString() || 'N/A'}`,
          )
          .text(
            `Currently Studying: ${education.currently_studying ? 'Yes' : 'No'}`,
          )
          .moveDown();
      });

      // Work Experience Section
      doc
        .font('Helvetica-Bold')
        .fontSize(16)
        .text('Work Experience', 100, doc.y)
        .moveDown()
        .fontSize(12);
      user.work_experience_ids.forEach((work: any) => {
        doc
          .text(`Company: ${work.company || 'N/A'}`)
          .text(`Position: ${work.position || 'N/A'}`)
          .text(
            `Start Date: ${new Date(work.start_date).toLocaleDateString() || 'N/A'}`,
          )
          .text(`Currently Working: ${work.currently_working ? 'Yes' : 'No'}`)
          .moveDown();
      });

      // Skills Section
      doc
        .font('Helvetica-Bold')
        .fontSize(16)
        .text('Skills', 100, doc.y)
        .moveDown()
        .fontSize(12);
      user.skills.forEach((skill: any) => {
        doc
          .text(`Skill: ${skill.name || 'N/A'}`)
          .text(`Evaluation: ${skill.evalute || 'N/A'}`)
          .text(`Description: ${skill.description || 'N/A'}`)
          .moveDown();
      });

      // Certificates Section
      doc
        .font('Helvetica-Bold')
        .fontSize(16)
        .text('Certificates', 100, doc.y)
        .moveDown()
        .fontSize(12);
      user.certificates.forEach((certificate: any) => {
        doc
          .text(`Certificate: ${certificate.certificate_name || 'N/A'}`)
          .text(`Organization: ${certificate.organization_name || 'N/A'}`)
          .text(
            `Start Date: ${new Date(certificate.start_date).toLocaleDateString() || 'N/A'}`,
          )
          .moveDown();
      });

      // Projects Section
      doc
        .font('Helvetica-Bold')
        .fontSize(16)
        .text('Projects', 100, doc.y)
        .moveDown()
        .fontSize(12);
      projects.forEach((proj: any) => {
        doc
          .text(`Project Name: ${proj.project_name || 'N/A'}`)
          .text(`Technology: ${proj.technology || 'N/A'}`)
          .text(`Link: ${proj.project_link || 'N/A'}`)
          .moveDown();
      });

      // Prizes Section
      doc
        .font('Helvetica-Bold')
        .fontSize(16)
        .text('Prizes', 100, doc.y)
        .moveDown()
        .fontSize(12);
      user.prizes.forEach((prize: any) => {
        doc
          .text(`Prize: ${prize.prize_name || 'N/A'}`)
          .text(`Organization: ${prize.organization_name || 'N/A'}`)
          .text(
            `Date: ${new Date(prize.date_of_receipt).toLocaleDateString() || 'N/A'}`,
          )
          .text(`Link: ${prize.prize_link || 'N/A'}`)
          .moveDown();
      });

      const buffer: any[] = [];
      doc.on('data', buffer.push.bind(buffer));
      doc.on('end', () => {
        resolve(Buffer.concat(buffer));
      });
      doc.end();
    });

    return pdfBuffer;
  }

  async downloadPFD(): Promise<any> {}

  async delete(id: string, userId: string): Promise<void> {
    const cv = await this.cvRepository.findById(id).exec();
    if (!cv) {
      throw new NotFoundException(`cv #${id} not found`);
    }
    if (cv?.user_id === new Types.ObjectId(userId)) {
      throw new ForbiddenException('You are not allowed to delete this cv');
    }

    const result = await this.cvRepository.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      throw new BadRequestException('cv not found or could not be deleted');
    }

    await this.userModel.updateOne({ _id: cv.user_id }, { $pull: { cvs: id } });
  }
}
