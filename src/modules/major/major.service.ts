import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateMajorDto, DeleteMarjorDto } from './dto/create-major.dto';
import { UpdateMajorDto } from './dto/update-major.dto';
import aqp from 'api-query-params';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Major } from './schema/Major.schema';

@Injectable()
export class MajorService {
  constructor(@InjectModel('Major') private majorModel: Model<Major>) {}
  async create(createMajorDto: CreateMajorDto) {
    const major = await this.majorModel.create(createMajorDto);
    if (major) {
      return {
        data: {
          items: major,
          message: ['Major created successfully'],
          error_code: 200,
        },
      };
    } else {
      return {
        data: {
          items: [],
          message: ['Major not created'],
          error_code: 400,
        },
      };
    }
  }

  async findAll(query: string, current: number, pageSize: number) {
    const { filter, sort } = aqp(query);
    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;

    if (!current) current = 1;
    if (!pageSize) pageSize = 10;
    const totalItems = (await this.majorModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (+current - 1) * pageSize;
    const result = await this.majorModel
      .find(filter)
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

  findOne(id: number) {
    return `This action returns a #${id} major`;
  }

  update(id: number, updateMajorDto: UpdateMajorDto) {
    return `This action updates a #${id} major`;
  }

  async remove(deleteDto: DeleteMarjorDto) {
    const { ids } = deleteDto;
    if (!Array.isArray(ids)) {
      throw new BadRequestException('Ids not is array');
    }
    if (ids.length < 0) {
      throw new BadRequestException('Ids not found');
    }
    if (ids.length === 1) {
      const res = await this.majorModel.deleteOne({ _id: ids[0] });
      if (res.deletedCount > 0) {
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
      const res = await this.majorModel.deleteMany({ _id: { $in: ids } });
      if (res.deletedCount > 0) {
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
}
