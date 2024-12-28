import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateLevelDto } from './dto/create-level.dto';
import { UpdateLevelDto } from './dto/update-level.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Level } from './schema/Level.schema';
import aqp from 'api-query-params';
import { ILevelService } from './level.interface';
import { Meta } from '../types';

@Injectable()
export class LevelService implements ILevelService {
  constructor(
    @InjectModel(Level.name) private readonly levelModel: Model<Level>,
  ) {}
  async create(createLevelDto: CreateLevelDto): Promise<Level> {
    const level = await this.levelModel.create(createLevelDto);
    if (!level) {
      throw new BadRequestException('Failed');
    }
    return level;
  }

  async findAll(
    query: string,
    current: number,
    pageSize: number,
  ): Promise<{ items: Level[]; meta: Meta }> {
    const { filter, sort } = aqp(query);
    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;
    if (!current) current = 1;
    if (!pageSize) pageSize = 10;
    const totalItems = (await this.levelModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (+current - 1) * pageSize;
    const result = await this.levelModel
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

  async findOne(id: string): Promise<Level> {
    const job = await this.levelModel.findOne({ _id: id });
    if (!job) {
      throw new NotFoundException();
    }
    return job;
  }

  async update(id: string, updateLevelDto: UpdateLevelDto): Promise<Level> {
    const job = await this.levelModel.findByIdAndUpdate(id, updateLevelDto, {
      new: true,
      runValidators: true,
    });
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
        const job = await this.levelModel.findById(ids[0]);
        if (!job) {
          throw new NotFoundException();
        }
        const result = await this.levelModel.deleteOne({ _id: ids[0] });
        if (result.deletedCount > 0) {
          return [];
        } else {
          throw new BadRequestException('Delete failed!');
        }
      } else {
        const jobs = await this.levelModel.find({ _id: { $in: ids } });
        if (!jobs) {
          throw new NotFoundException();
        }
        const result = await this.levelModel.deleteMany({
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
