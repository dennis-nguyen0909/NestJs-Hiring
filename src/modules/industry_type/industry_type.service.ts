import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import aqp from 'api-query-params';
import { IndustryType } from './schema/industry_type.schema';
import { CreateIndustryTypeDto } from './dto/create-industry_type.dto';
import { UpdateIndustryTypeDto } from './dto/update-industry_type.dto';
import { IIndustryTypeService } from './industry_type.interface';
import { Meta } from '../types';

@Injectable()
// eslint-disable-next-line prettier/prettier
export class IndustryTypeService implements IIndustryTypeService{
  constructor(
    @InjectModel(IndustryType.name)
    private readonly industryTypeModel: Model<IndustryType>,
  ) {}
  async create(createDto: CreateIndustryTypeDto): Promise<IndustryType> {
    const response = await this.industryTypeModel.create(createDto);
    if (!response) {
      throw new BadRequestException('Failed');
    }
    return response;
  }

  async findAll(
    query: string,
    current: number,
    pageSize: number,
  ): Promise<{ items: IndustryType[]; meta: Meta }> {
    const { filter, sort } = aqp(query);
    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;
    if (!current) current = 1;
    if (!pageSize) pageSize = 10;
    const totalItems = (await this.industryTypeModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (+current - 1) * pageSize;
    const result = await this.industryTypeModel
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

  async findOne(id: string): Promise<IndustryType> {
    const response = await this.industryTypeModel.findOne({ _id: id });
    if (!response) {
      throw new NotFoundException();
    }
    return response;
  }

  async update(
    id: string,
    updateDto: UpdateIndustryTypeDto,
  ): Promise<IndustryType> {
    const response = await this.industryTypeModel.findByIdAndUpdate(
      id,
      updateDto,
      {
        new: true,
        runValidators: true,
      },
    );
    if (!response) {
      throw new NotFoundException();
    }
    return response;
  }

  async remove(ids: Array<string>): Promise<[]> {
    try {
      if (ids.length < 0) {
        throw new BadRequestException('Ids not found');
      }
      if (!Array.isArray(ids)) {
        throw new BadRequestException('Ids phai la mang');
      }
      if (ids.length === 1) {
        const response = await this.industryTypeModel.findById(ids[0]);
        if (!response) {
          throw new NotFoundException();
        }
        const result = await this.industryTypeModel.deleteOne({
          _id: ids[0],
        });
        if (result.deletedCount > 0) {
          return [];
        } else {
          throw new BadRequestException('Delete failed!');
        }
      } else {
        const response = await this.industryTypeModel.find({
          _id: { $in: ids },
        });
        if (!response) {
          throw new NotFoundException();
        }
        const result = await this.industryTypeModel.deleteMany({
          _id: { $in: ids },
        });
        if (result.deletedCount > 0) {
          return [];
        } else {
          throw new BadRequestException('Delete failed!');
        }
      }
    } catch (error) {
      throw new NotFoundException(error);
    }
  }
}
