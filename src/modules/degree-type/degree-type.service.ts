import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import aqp from 'api-query-params';
import { DegreeType } from './schema/degree-type.schema';
import { CreateDegreeTypeDto } from './dto/create-degree-type.dto';
import { UpdateDegreeTypeDto } from './dto/update-degree-type.dto';
import { IDegreeTypeService } from './degree-type.interface';
import { Meta } from '../types';

@Injectable()
export class DegreeTypeService implements IDegreeTypeService {
  constructor(
    @InjectModel(DegreeType.name)
    private readonly degreeTypeModel: Model<DegreeType>,
  ) {}
  async create(data: CreateDegreeTypeDto): Promise<DegreeType> {
    const response = await this.degreeTypeModel.create(data);
    if (!response) {
      throw new BadRequestException('Failed');
    }
    return response;
  }

  async findAll(
    query: string,
    current: number,
    pageSize: number,
  ): Promise<{ items: DegreeType[]; meta: Meta }> {
    const { filter, sort } = aqp(query);
    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;
    if (!current) current = 1;
    if (!pageSize) pageSize = 10;
    const totalItems = (await this.degreeTypeModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (+current - 1) * pageSize;
    const result = await this.degreeTypeModel
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

  async findOne(id: string): Promise<DegreeType> {
    const job = await this.degreeTypeModel.findOne({ _id: id });
    if (!job) {
      throw new NotFoundException();
    }
    return job;
  }

  async update(
    id: string,
    updateLevelDto: UpdateDegreeTypeDto,
  ): Promise<DegreeType> {
    const job = await this.degreeTypeModel.findByIdAndUpdate(
      id,
      updateLevelDto,
      {
        new: true,
        runValidators: true,
      },
    );
    if (!job) {
      throw new NotFoundException();
    }
    return job;
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
        const job = await this.degreeTypeModel.findById(ids[0]);
        if (!job) {
          throw new NotFoundException();
        }
        const result = await this.degreeTypeModel.deleteOne({ _id: ids[0] });
        if (result.deletedCount > 0) {
          return [];
        } else {
          throw new BadRequestException('Delete failed!');
        }
      } else {
        const jobs = await this.degreeTypeModel.find({ _id: { $in: ids } });
        if (!jobs) {
          throw new NotFoundException();
        }
        const result = await this.degreeTypeModel.deleteMany({
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
