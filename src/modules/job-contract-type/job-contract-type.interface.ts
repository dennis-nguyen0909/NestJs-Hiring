import { Meta } from '../types';
import { CreateJobContractTypeDto } from './dto/create-job-contract-type.dto';
import { UpdateJobContractTypeDto } from './dto/update-job-contract-type.dto';
import { JobContractType } from './schema/job-contract-type.schema';

export interface IJobContractTypeService {
  create(data: CreateJobContractTypeDto): Promise<JobContractType>;

  findAll(
    query: string,
    current: number,
    pageSize: number,
  ): Promise<{
    items: JobContractType[];
    meta: Meta;
  }>;

  findOne(id: string): Promise<JobContractType>;

  update(
    id: string,
    updateJobContractTypeDto: UpdateJobContractTypeDto,
  ): Promise<JobContractType>;

  remove(ids: string[]): Promise<[]>;
}
