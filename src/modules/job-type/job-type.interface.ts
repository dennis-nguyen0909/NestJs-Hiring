import { Meta } from '../types';
import { CreateJobTypeDto } from './dto/create-job-type.dto';
import { UpdateJobTypeDto } from './dto/update-job-type.dto';
import { JobType } from './schema/JobType.schema';

export interface IJobTypeService {
  create(data: CreateJobTypeDto): Promise<JobType>;

  findAll(
    query: string,
    current: number,
    pageSize: number,
  ): Promise<{
    items: JobType[];
    meta: Meta;
  }>;

  findOne(id: string): Promise<JobType>;

  update(id: string, updateJobTypeDto: UpdateJobTypeDto): Promise<JobType>;

  remove(ids: string[]): Promise<[]>;
}
