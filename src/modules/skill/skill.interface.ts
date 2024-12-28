import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { DeleteSkillDto } from './dto/delete-skill.dto';
import { Skill } from './schema/Skill.schema';
import { Meta } from '../types';

export interface ISkillService {
  create(createSkillDto: CreateSkillDto): Promise<Skill>;

  findAll(
    query: string,
    current: number,
    pageSize: number,
  ): Promise<{ items: Skill[]; meta: Meta }>;

  findOne(id: string): Promise<Skill>;

  update(id: string, updateSkillDto: UpdateSkillDto): Promise<Skill>;

  remove(data: DeleteSkillDto): Promise<[]>;

  getSkillsByUserId(userId: string): Promise<Skill[]>;
}
