import { Meta } from '../types';
import { CreateLevelDto } from './dto/create-level.dto';
import { UpdateLevelDto } from './dto/update-level.dto';
import { Level } from './schema/Level.schema';

export interface ILevelService {
  create(createLevelDto: CreateLevelDto): Promise<Level>;

  findAll(
    query: string,
    current: number,
    pageSize: number,
  ): Promise<{
    items: Level[];
    meta: Meta;
  }>;

  findOne(id: string): Promise<Level>;

  update(id: string, updateLevelDto: UpdateLevelDto): Promise<Level>;

  remove(ids: string[]): Promise<[]>;
}
