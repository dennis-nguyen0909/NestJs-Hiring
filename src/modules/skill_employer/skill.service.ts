import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSkillEmployerDto } from './dto/create-skill.dto';
import { UpdateSkillEmployerDto } from './dto/update-skill.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import aqp from 'api-query-params';
import { DeleteSkillEmployerDto } from './dto/delete-skill.dto';
import { SkillEmployer } from './schema/EmployerSkill.schema';

@Injectable()
export class SkillEmployerServices {
  constructor(
    @InjectModel(SkillEmployer.name)
    private skillEmployerModel: Model<SkillEmployer>,
  ) {}
  async create(CreateSkillEmployerDto: CreateSkillEmployerDto) {
    try {
      const skill = await this.skillEmployerModel.create(
        CreateSkillEmployerDto,
      );
      return skill;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async findAll(query: string, current: number, pageSize: number) {
    const { filter, sort } = aqp(query);
    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;

    if (!current) current = 1;
    if (!pageSize) pageSize = 10;

    const totalItems = (await this.skillEmployerModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (+current - 1) * pageSize;
    const result = await this.skillEmployerModel
      .find(filter)
      .limit(pageSize)
      .skip(skip)
      .sort(sort as any);
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

  findOne(id: string) {
    const skill = this.skillEmployerModel.findOne({ _id: id });
    if (!skill) {
      throw new NotFoundException();
    }
    return skill;
  }

  update(id: string, UpdateSkillEmployerDto: UpdateSkillEmployerDto) {
    const skill = this.skillEmployerModel.updateOne(
      { _id: id },
      UpdateSkillEmployerDto,
    );
    if (!skill) {
      throw new NotFoundException();
    }
    return skill;
  }

  async remove(data: DeleteSkillEmployerDto) {
    const { ids } = data;
    try {
      if (!Array.isArray(ids) || ids.length < 0) {
        throw new NotFoundException('Ids not found');
      }
      if (ids.length === 1) {
        const checkNotExists = await this.skillEmployerModel.findOne({
          _id: ids[0],
        });
        if (!checkNotExists) {
          throw new NotFoundException('Ids not found');
        }
        const result = await this.skillEmployerModel.deleteOne({ _id: ids[0] });
        if (result.deletedCount > 0) {
          return [];
        } else {
          throw new BadRequestException('Delete failed');
        }
      } else {
        const checkNotExists = await this.skillEmployerModel.findOne({
          _id: { $in: ids },
        });
        if (!checkNotExists) {
          throw new NotFoundException('Ids not found');
        }
        const result = await this.skillEmployerModel.deleteMany({
          _id: { $in: ids },
        });

        if (result.deletedCount > 0) {
          return [];
        } else {
          throw new BadRequestException('Delete failed');
        }
      }
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
  async getSkillsByUserId(
    userId: string,
    current: number,
    pageSize: number,
    query: string,
  ) {
    try {
      // Xử lý bộ lọc và sắp xếp từ query
      const { filter, sort } = aqp(query);
      if (filter.current) delete filter.current;
      if (filter.pageSize) delete filter.pageSize;

      if (!current) current = 1;
      if (!pageSize) pageSize = 10;
      // Lọc theo userId
      filter.user_id = userId;

      // Xóa các tham số phân trang từ filter nếu có
      if (filter.current) delete filter.current;
      if (filter.pageSize) delete filter.pageSize;
      // Tính tổng số mục
      const totalItems = (await this.skillEmployerModel.find(filter)).length;

      // Tính tổng số trang
      const totalPages = Math.ceil(totalItems / pageSize);
      // Tính số mục cần bỏ qua
      const skip = (current - 1) * pageSize;

      // Truy vấn dữ liệu với phân trang và sắp xếp
      const result = await this.skillEmployerModel
        .find(filter)
        .limit(pageSize)
        .skip(skip)
        .sort(sort as any);

      // Nếu không tìm thấy kết quả
      if (!result.length) {
        throw new NotFoundException('Not found!');
      }

      // Trả về dữ liệu cùng với meta thông tin về phân trang
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
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
