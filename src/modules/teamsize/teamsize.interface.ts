import { Meta } from '../types';
import { CreateTeamsizeDto } from './dto/create-teamsize.dto';
import { UpdateTeamsizeDto } from './dto/update-teamsize.dto';
import { TeamSize } from './schema/team_size.schema';

export interface ITeamsizeService {
  create(createDto: CreateTeamsizeDto): Promise<TeamSize>;
  findAll(
    query: string,
    current: number,
    pageSize: number,
  ): Promise<{
    items: TeamSize[];
    meta: Meta;
  }>;
  findOne(id: string): Promise<TeamSize>;
  update(id: string, updateDto: UpdateTeamsizeDto): Promise<TeamSize>;
  remove(ids: string[]): Promise<[]>;
}
