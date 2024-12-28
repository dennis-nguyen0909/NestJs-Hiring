import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './schema/project.schema';
import { Meta } from '../types';

export interface IProjectService {
  create(createProjectDto: CreateProjectDto): Promise<Project>;

  findAll(
    query: string,
    current: number,
    pageSize: number,
  ): Promise<{ items: Project[]; meta: Meta }>;

  findOne(id: string): Promise<Project>;

  update(id: string, updateProjectDto: UpdateProjectDto): Promise<Project>;

  remove(id: string, userId: string): Promise<void>;
}
