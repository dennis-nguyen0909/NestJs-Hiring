import { Request } from 'express';
import { Meta } from '../types';
import { CreateWorkExperienceDto } from './dto/create-work-experience.dto';
import { UpdateWorkExperienceDto } from './dto/update-work-experience.dto';
import { WorkExperience } from './schema/WorkExperience.schema';

export interface IWorkExperienceService {
  create(
    createWorkExperienceDto: CreateWorkExperienceDto,
    req: Request,
  ): Promise<WorkExperience>;
  findAll(
    query: string,
    current: number,
    pageSize: number,
  ): Promise<{
    items: WorkExperience[];
    meta: Meta;
  }>;
  getWorkExperienceByUserId(userId: string): Promise<WorkExperience[]>;
  findOne(id: string): Promise<WorkExperience>;
  update(
    id: string,
    updateWorkExperienceDto: UpdateWorkExperienceDto,
    req: Request,
  ): Promise<WorkExperience>;
  remove(ids: Array<string>, req: Request): Promise<[]>;
}
