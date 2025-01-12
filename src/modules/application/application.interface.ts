import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { DeleteApplicationDto } from './dto/delete-application.dto';
import { Application } from './schema/Application.schema';
import { Meta } from '../types';

export interface IApplicationService {
  create(createApplicationDto: CreateApplicationDto): Promise<Application>;
  findAll(
    query: string,
    current: number,
    pageSize: number,
  ): Promise<{ items: Application[]; meta: Meta }>;
  findOne(id: string): Promise<Application>;
  update(
    id: string,
    updateApplicationDto: UpdateApplicationDto,
  ): Promise<Application>;
  toggleSaveCandidate(
    applicationId: string,
    userId: string,
  ): Promise<Application>;
  remove(data: DeleteApplicationDto): Promise<[]>;
  getApplicationByJobId(
    jobId: string,
    query: string,
    current: number,
    pageSize: number,
  ): Promise<any>;
  cancelApplication(applicationId: string, userId: string): Promise<any>;
  getAppliedUserId(userId: string): Promise<number>;
  getRecentlyApplied(
    candidateId: string,
    query: string,
    current: number,
    pageSize: number,
  ): Promise<{ items: Application[]; meta: Meta }>;
  getRecentlyAppliedCandidate(
    query: string,
    current: number,
    pageSize: number,
  ): Promise<any>;
}
