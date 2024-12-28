import { Meta } from '../types';
import { CreateMajorDto, DeleteMarjorDto } from './dto/create-major.dto';
import { UpdateMajorDto } from './dto/update-major.dto';
import { Major } from './schema/Major.schema';

export interface IMajorService {
  create(createMajorDto: CreateMajorDto): Promise<Major>;

  findAll(
    query: string,
    current: number,
    pageSize: number,
  ): Promise<{ items: Major[]; meta: Meta }>;

  findOne(id: string): Promise<Major>;

  update(id: string, updateMajorDto: UpdateMajorDto): Promise<Major>;

  remove(deleteDto: DeleteMarjorDto): Promise<{ message: string; data: [] }>;
}
