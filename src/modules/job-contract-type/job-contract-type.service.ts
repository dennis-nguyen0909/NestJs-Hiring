import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import aqp from 'api-query-params';
import { JobContractType } from './schema/job-contract-type.schema';
import { CreateJobContractTypeDto } from './dto/create-job-contract-type.dto';
import { UpdateJobContractTypeDto } from './dto/update-job-contract-type.dto';
import { Meta } from '../types';
import { IJobContractTypeService } from './job-contract-type.interface';

@Injectable()
export class JobContractTypeService implements IJobContractTypeService {
  constructor(
    @InjectModel(JobContractType.name)
    private readonly jobContractType: Model<JobContractType>,
  ) {}
  async create(data: CreateJobContractTypeDto): Promise<JobContractType> {
    const response = await this.jobContractType.create(data);
    if (!response) {
      throw new BadRequestException('Failed');
    }
    return response;
  }

  async findAll(
    query: string,
    current: number,
    pageSize: number,
  ): Promise<{ items: JobContractType[]; meta: Meta }> {
    const { filter, sort } = aqp(query);
    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;
    if (!current) current = 1;
    if (!pageSize) pageSize = 10;
    const totalItems = (await this.jobContractType.find(filter)).length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (+current - 1) * pageSize;
    const result = await this.jobContractType
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

  async findOne(id: string): Promise<JobContractType> {
    const job = await this.jobContractType.findOne({ _id: id });
    if (!job) {
      throw new NotFoundException();
    }
    return job;
  }

  async update(
    id: string,
    updateLevelDto: UpdateJobContractTypeDto,
  ): Promise<JobContractType> {
    const job: JobContractType = await this.jobContractType.findByIdAndUpdate(
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
        const job = await this.jobContractType.findById(ids[0]);
        if (!job) {
          throw new NotFoundException();
        }
        const result = await this.jobContractType.deleteOne({ _id: ids[0] });
        if (result.deletedCount > 0) {
          return [];
        } else {
          throw new BadRequestException('Delete failed!');
        }
      } else {
        const jobs = await this.jobContractType.find({ _id: { $in: ids } });
        if (!jobs) {
          throw new NotFoundException();
        }
        const result = await this.jobContractType.deleteMany({
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
