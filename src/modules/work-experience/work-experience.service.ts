/* eslint-disable prettier/prettier */
import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateWorkExperienceDto } from './dto/create-work-experience.dto';
import { UpdateWorkExperienceDto } from './dto/update-work-experience.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { WorkExperience } from './schema/WorkExperience.schema';
import aqp from 'api-query-params';
import { User } from '../users/schemas/user.schema';
import { IWorkExperienceService } from './work-exxperience.interface';
import { Meta } from '../types';
import { Request } from 'express';
import { LogService } from 'src/log/log.service';

@Injectable()
export class WorkExperienceService implements IWorkExperienceService {
  constructor(
    @InjectModel(WorkExperience.name)
    private workExperienceModel: Model<WorkExperience>,
    @InjectModel(User.name)
    private userModel: Model<User>,
    private logService: LogService,
  ) {}
  async create(
    createWorkExperienceDto: CreateWorkExperienceDto,
    req: Request,
  ): Promise<WorkExperience> {
    const session = await this.workExperienceModel.startSession();
    session.startTransaction();
    try {
      console.log('create', createWorkExperienceDto);
      const workExperience = await this.workExperienceModel.create(
        createWorkExperienceDto,
      );
      // Cập nhật thông tin người dùng, thêm ObjectId của bản ghi Education vào mảng education_ids
      const user = await this.userModel.findOneAndUpdate(
        { _id: workExperience.user_id },
        { $push: { work_experience_ids: workExperience._id } }, // Thêm ObjectId của Education vào mảng education_ids của User
        { new: true, session }, // Trả về tài liệu người dùng đã được cập nhật
      );

      // Kiểm tra xem người dùng có tồn tại không
      if (!user) {
        throw new BadRequestException('Không tìm thấy người dùng');
      }

      if (!workExperience) {
        throw new BadGatewayException('WorkExperience not created');
      }
      await this.logService.createLog({
        userId: new Types.ObjectId(user?._id + ''),
        userRole: 'CANDIDATE',
        action: 'CREATE',
        entityId: workExperience._id.toString(),
        entityCollection: 'work_experience',
        entityName: workExperience?.company,
        activityDetail: 'user_create_work_experience',
        description: 'User create work experience',
        req: req,
        changeColumns: {
          company: { value: workExperience?.company },
          position: { value: workExperience?.position },
          start_date: { value: workExperience?.start_date },
          end_date: { value: workExperience?.end_date },
          description: { value: workExperience?.description },
          currently_working: { value: workExperience?.currently_working },
        },
      });
      await session.commitTransaction();
      return workExperience;
    } catch (error) {
      await session.abortTransaction();
      throw new BadGatewayException(error);
    }
  }

  async findAll(
    query: string,
    current: number,
    pageSize: number,
  ): Promise<{ items: WorkExperience[]; meta: Meta }> {
    const { filter, sort } = aqp(query);
    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;
    if (!current) current = 1;
    if (!pageSize) pageSize = 10;
    const totalItems = (await this.workExperienceModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (+current - 1) * pageSize;
    const result = await this.workExperienceModel
      .find(filter)
      .limit(pageSize)
      .skip(skip)
      .sort({ createdAt: -1, ...sort });
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

  async getWorkExperienceByUserId(userId: string): Promise<WorkExperience[]> {
    const res = await this.workExperienceModel.find({ user_id: userId });
    if (!res) {
      throw new BadGatewayException('WorkExperience not found');
    }
    return res;
  }

  async findOne(id: string): Promise<WorkExperience> {
    const res = await this.workExperienceModel.findById(id);
    if (!res) {
      throw new BadGatewayException('WorkExperience not found');
    }
    return res;
  }

  async update(
    id: string,
    updateWorkExperienceDto: UpdateWorkExperienceDto,
    req: Request,
  ): Promise<WorkExperience> {
    const session = await this.workExperienceModel.startSession();
    session.startTransaction();
    try {
      const work = await this.workExperienceModel.findById(id);
      if (!work) {
        throw new BadGatewayException('WorkExperiene not found!');
      }
      const update = await this.workExperienceModel
        .findByIdAndUpdate(id, updateWorkExperienceDto, {
          new: true,
          runValidators: true,
        })
        .exec();
      if (!update) {
        throw new BadGatewayException('Update error!');
      }
      const changes = {};
      for (const key in updateWorkExperienceDto) {
        if (key !== '_id' && key !== 'id' && key !== 'user_id') {
          // Bỏ qua _id hoặc id
          if (work[key] !== updateWorkExperienceDto[key]) {
            changes[key] = {
              old: work[key],
              new: updateWorkExperienceDto[key],
            };
          }
        }
      }

      await this.logService.createLog({
        userId: new Types.ObjectId(work?.user_id + ''),
        userRole: 'CANDIDATE',
        action: 'UPDATE',
        entityId: work?._id.toString(),
        entityCollection: 'work_experience',
        entityName: work?.company,
        activityDetail: 'user_update_work_experience',
        description: 'User update work experience',
        req: req,
        changes: changes,
      });

      return update;
    } catch (error) {
      await session.abortTransaction();
      throw new BadGatewayException(error.message);
    } finally {
      await session.endSession();
    }
  }

  async remove(ids: Array<string>, req: Request): Promise<[]> {
    if (!Array.isArray(ids)) {
      throw new BadRequestException('Ids not is array');
    }
    if (ids.length < 0) {
      throw new BadRequestException('Ids not found');
    }
    if (ids.length === 1) {
      try {
        const workExperience = await this.workExperienceModel.findById(ids[0]);
        if (!workExperience) {
          throw new NotFoundException('Not found');
        }
        const deleted = await this.workExperienceModel.deleteOne({
          _id: ids[0],
        });
        if (deleted.deletedCount > 0) {
          await this.userModel.updateOne(
            { _id: workExperience.user_id },
            { $pull: { work_experience_ids: new Types.ObjectId(ids[0]) } },
          );
          return [];
        } else {
          throw new NotFoundException();
        }
      } catch (error) {
        throw new NotFoundException(error);
      }
    } else {
      try {
        // Bước 1: Tìm các bản ghi workExperience dựa trên ids được truyền vào
        const workExperiences = await this.workExperienceModel.find({
          _id: { $in: ids },
        });

        if (!workExperiences || workExperiences.length === 0) {
          throw new NotFoundException('Work experiences not found');
        }
        const deleted = await this.workExperienceModel.deleteMany({
          _id: { $in: ids },
        });

        if (deleted.deletedCount > 0) {
          await this.userModel.updateOne(
            { _id: workExperiences[0].user_id },
            { $pull: { work_experience_ids: { $in: ids } } },
          );

          return [];
        } else {
          throw new NotFoundException('Failed to delete work experiences');
        }
      } catch (error) {
        throw new NotFoundException(error.message || 'An error occurred');
      }
    }
  }
}
