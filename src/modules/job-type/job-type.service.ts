import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import aqp from 'api-query-params';
import { JobType } from './schema/JobType.schema';
import { CreateJobTypeDto } from './dto/create-job-type.dto';
import { UpdateJobTypeDto } from './dto/update-job-type.dto';
import { IJobTypeService } from './job-type.interface';
import { Meta } from '../types';

@Injectable()
export class JobTypeService implements IJobTypeService {
  constructor(
    @InjectModel('JobType') private readonly jobTypeModel: Model<JobType>,
  ) {}
  async create(createJobType: CreateJobTypeDto): Promise<JobType> {
    const jobType = await this.jobTypeModel.create(createJobType);
    if (!jobType) {
      throw new BadRequestException('Failed');
    }
    return jobType;
  }

  async findAll(
    query: string,
    current: number,
    pageSize: number,
  ): Promise<{ items: JobType[]; meta: Meta }> {
    const { filter, sort } = aqp(query);
    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;
    if (!current) current = 1;
    if (!pageSize) pageSize = 10;
    const totalItems = (await this.jobTypeModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (+current - 1) * pageSize;
    const result = await this.jobTypeModel
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

  async findOne(id: string): Promise<JobType> {
    const job = await this.jobTypeModel.findOne({ _id: id });
    if (!job) {
      throw new NotFoundException();
    }
    return job;
  }

  async update(id: string, updateLevelDto: UpdateJobTypeDto): Promise<JobType> {
    const job = await this.jobTypeModel.findByIdAndUpdate(id, updateLevelDto, {
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
        const job = await this.jobTypeModel.findById(ids[0]);
        if (!job) {
          throw new NotFoundException();
        }
        const result = await this.jobTypeModel.deleteOne({ _id: ids[0] });
        if (result.deletedCount > 0) {
          return [];
        } else {
          throw new BadRequestException('Delete failed!');
        }
      } else {
        const jobs = await this.jobTypeModel.find({ _id: { $in: ids } });
        if (!jobs) {
          throw new NotFoundException();
        }
        const result = await this.jobTypeModel.deleteMany({
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
