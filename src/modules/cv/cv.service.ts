/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
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
import * as fs from 'fs';
import * as path from 'path';
import { User } from '../users/schemas/User.schema';
import { Project } from '../project/schema/project.schema';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
@Injectable()
export class CvService {
  constructor(
    @InjectModel('CV') private cvRepository: Model<CV>,
    @InjectModel(User.name) private userModel: Model<User>,
   private cloudinaryService:CloudinaryService
  ) {}
  async create(createCvDto: CreateCvDto) {
   const cv:CV = await this.cvRepository.create(createCvDto);
   const user:User = await this.userModel.findOne({_id:createCvDto.user_id})
   if(!user){
     throw new BadRequestException('user not found')
   }
    if(!cv){
      throw new BadRequestException('cv not created')
    }
    user.cvs.push(cv._id as any)
    await user.save()
    return cv
  }

  async findAll(query: string, current: number, pageSize: number) {
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

  async findOne(id: string) {
    return await this.cvRepository.findById(id);
  }

  async update(id: string, updateCvDto: UpdateCvDto) {
    try {
      const cv = await this.cvRepository.findByIdAndUpdate(id, updateCvDto, {
        new: true,
      });
      if (cv) {
        return {
          message: 'Cv updated successfully',
          data: cv,
        };
      }
    } catch (error) {
      throw new NotFoundException(error);
    }
  }

  async remove(data: DeleteCvDto,userId:string) {
    const { ids } = data;
    const user:User = await this.userModel.findOne({_id:userId})
    if(!user){
      throw new BadRequestException('user not found')
    }
    if (!Array.isArray(ids)) {
      throw new BadRequestException('Ids not is array');
    }
    if (ids.length < 0) {
      throw new BadRequestException('Ids not found');
    }
    if (ids.length === 1) {
      const res = await this.cvRepository.deleteOne({ _id: ids[0] });
      if (res.deletedCount > 0) {
        await this.userModel.updateOne(
          { _id: ids[0] },
          { $pull: { cvs: ids[0] } },
        );
        return {
          message: 'Cv deleted successfully',
          data: [],
        };
      } else {
        return {
          message: 'Cv not found',
          data: [],
        };
      }
    } else {
      const res = await this.cvRepository.deleteMany({ _id: { $in: ids } });
      if (res.deletedCount > 0) {
        await this.userModel.updateMany(
          { _id: { $in: ids } },
          { $pull: { cvs: { $in: ids } } },
        );
        
        return {
          message: 'Cv deleted successfully',
          data: [],
        };
      } else {
        return {
          message: 'Cv not found',
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
  ) {
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
  async generalPDF(id: string): Promise<Buffer> {
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

  async downloadPFD(){

  }

  async delete(id: string, userId: string) {
    const cv = await this.cvRepository.findById(id).exec();
    if (!cv) {
      throw new NotFoundException(`cv #${id} not found`);
    }
    if (cv?.user_id === new Types.ObjectId(userId)) {
      throw new ForbiddenException(
        'You are not allowed to delete this cv',
      );
    }

    const result = await this.cvRepository.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      throw new BadRequestException(
        'cv not found or could not be deleted',
      );
    }
    
    await this.userModel.updateOne(
      { _id: cv.user_id },
      { $pull: { cvs: id } }, 
    );
  }
}
