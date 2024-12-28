import { CreateSkillEmployerDto } from './dto/create-skill.dto';
import { UpdateSkillEmployerDto } from './dto/update-skill.dto';
import { DeleteSkillEmployerDto } from './dto/delete-skill.dto';
import { Meta } from '../types';
import { SkillEmployer } from './schema/EmployerSkill.schema';

export interface ISkillEmployerService {
  create(
    createSkillEmployerDto: CreateSkillEmployerDto,
  ): Promise<SkillEmployer>;
  findAll(
    query: string,
    current: number,
    pageSize: number,
  ): Promise<{ items: SkillEmployer[]; meta: Meta }>;
  findOne(id: string): Promise<SkillEmployer>;
  update(
    id: string,
    updateSkillEmployerDto: UpdateSkillEmployerDto,
  ): Promise<SkillEmployer>;
  remove(data: DeleteSkillEmployerDto): Promise<[]>;
  getSkillsByUserId(
    userId: string,
    current: number,
    pageSize: number,
    query: string,
  ): Promise<{ items: SkillEmployer[]; meta: Meta }>;
}
