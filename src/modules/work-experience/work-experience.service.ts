/* eslint-disable prettier/prettier */
import { BadGatewayException, BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateWorkExperienceDto } from './dto/create-work-experience.dto';
import { UpdateWorkExperienceDto } from './dto/update-work-experience.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { WorkExperience } from './schema/WorkExperience.schema';
import aqp from 'api-query-params';
import { User } from '../users/schemas/User.schema';

@Injectable()
export class WorkExperienceService {
  constructor(
    @InjectModel('WorkExperience')
    private workExperienceModel: Model<WorkExperience>,
    @InjectModel('User')
    private userModel: Model<User>,
  ) {}
  async create(createWorkExperienceDto: CreateWorkExperienceDto) {
    try {
      const workExperience = await this.workExperienceModel.create(
        createWorkExperienceDto,
      );
      // Cập nhật thông tin người dùng, thêm ObjectId của bản ghi Education vào mảng education_ids
      const user = await this.userModel.findOneAndUpdate(
        { _id: workExperience.user_id },
        { $push: { work_experience_ids: workExperience._id } }, // Thêm ObjectId của Education vào mảng education_ids của User
        { new: true }, // Trả về tài liệu người dùng đã được cập nhật
      );

      // Kiểm tra xem người dùng có tồn tại không
      if (!user) {
        throw new BadRequestException('Không tìm thấy người dùng');
      }

      if (!workExperience) {
        throw new BadGatewayException('WorkExperience not created');
      }
      return workExperience;
    } catch (error) {
      throw new BadGatewayException(error);
    }
  }

  async findAll(query: string, current: number, pageSize: number) {
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

  async getWorkExperienceByUserId(userId: string) {
    const res = await this.workExperienceModel.find({ user_id: userId });
    if (!res) {
      throw new BadGatewayException('WorkExperience not found');
    }
    return res;
  }

  async findOne(id: string) {
    const res = await this.workExperienceModel.findById(id);
    if (!res) {
      throw new BadGatewayException('WorkExperience not found');
    }
    return res;
  }

  async update(id: string, updateWorkExperienceDto: UpdateWorkExperienceDto) {
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
        return update;
    } catch (error) {
      throw new BadGatewayException(error.message);
    }
  }

  async remove(ids: Array<string>) {
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
            { _id:workExperience.user_id  },
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
            { $pull: { work_experience_ids: { $in: ids } } }
          );
    
          return { message: 'Work experiences deleted and user updated successfully' };
        } else {
          throw new NotFoundException('Failed to delete work experiences');
        }
      } catch (error) {
        throw new NotFoundException(error.message || 'An error occurred');
      }
    }
  }
}
