import { CreateJobDto } from './dto/create-job.dto';
import { DeleteJobDto } from './dto/delete-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { Job } from './schema/job.schema';

export interface IJobService {
  create(createJobDto: CreateJobDto): Promise<Job>;
  findAll(query: string, current: number, pageSize: number): Promise<any>;
  findOne(id: string): Promise<Job>;
  update(id: string, updateJobDto: UpdateJobDto): Promise<Job>;
  remove(data: DeleteJobDto): Promise<[]>;
  getJobByEmployer(
    user_id: string,
    query: string,
    current: number,
    pageSize: number,
  ): Promise<any>;
  getJobByDistrict(
    id: string,
    current: number,
    pageSize: number,
    query: string,
  ): Promise<Job[]>;
  validateExpiryDate(expireDate: string): void;
  validateSalaryRange(salaryRange: { min: number; max: number }): void;
}
