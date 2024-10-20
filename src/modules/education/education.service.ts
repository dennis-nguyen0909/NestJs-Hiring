import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateEducationDto } from './dto/create-education.dto';
import { UpdateEducationDto } from './dto/update-education.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Education } from './schema/Education.schema';
import { Model, Types } from 'mongoose';
import aqp from 'api-query-params';
import { create } from 'domain';

@Injectable()
export class EducationService {
  constructor(
    @InjectModel(Education.name)
    private readonly educationModel: Model<Education>,
  ) {}

  async addEducation(
    userId: string,
    updateEducationDto: UpdateEducationDto,
  ): Promise<Education> {
    try {
      const newEducation = new this.educationModel({
        ...updateEducationDto,
        user_id: userId, // Gán user_id cho bản ghi Education
      });

      return await newEducation.save();
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  // Lấy danh sách Education dựa trên userId
  async findEducationsByUserId(userId: string): Promise<Education[]> {
    return this.educationModel.find({ user_id: userId }).exec();
  }

  async findAll(
    query: string,
    current: number,
    pageSize: number,
  ): Promise<any> {
    const { filter, sort } = aqp(query);
    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;
    if (!current) current = 1;
    if (!pageSize) pageSize = 10;
    const totalItems = (await this.educationModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (+current - 1) * pageSize;
    const result = await this.educationModel
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

  async findOne(id: string): Promise<Education> {
    const education = await this.educationModel.findById({ _id: id });
    if (!education) {
      throw new BadRequestException('Không tìm thấy dữ liệu');
    }
    return education;
  }

  async updateByUserId(
    id: string,
    updateEducationDto: UpdateEducationDto,
    userId: string,
  ): Promise<any> {
    const education = await this.educationModel.findById({
      _id: id,
    });
    if (education.user_id + '' !== userId) {
      throw new BadRequestException('Không có quyền cập nhật');
    }

    return this.educationModel
      .findByIdAndUpdate(id, updateEducationDto, {
        new: true,
        runValidators: true,
      })
      .exec();
  }

  async deleteByUserId(id: string, userId: string): Promise<any> {
    const education = await this.educationModel.findById({
      _id: id,
    });
    if (education == null) {
      throw new BadRequestException('Không tìm thấy dữ liệu');
    }
    if (education.user_id + '' !== userId) {
      throw new BadRequestException('Không có quyền cập nhật');
    }
    const res = await this.educationModel.deleteOne({ _id: id });
    if (res.deletedCount > 0) {
      return [];
    } else {
      throw new BadRequestException('Xóa không thanh cong');
    }
  }
}
