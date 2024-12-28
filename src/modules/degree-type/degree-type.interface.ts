import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateDegreeTypeDto } from './dto/create-degree-type.dto';
import { UpdateDegreeTypeDto } from './dto/update-degree-type.dto';
import { DegreeType } from './schema/degree-type.schema';
import { Meta } from '../types';

export interface IDegreeTypeService {
  create(data: CreateDegreeTypeDto): Promise<DegreeType | BadRequestException>;
  findAll(
    query: string,
    current: number,
    pageSize: number,
  ): Promise<{
    items: DegreeType[];
    meta: Meta;
  }>;
  findOne(id: string): Promise<DegreeType | NotFoundException>;
  update(
    id: string,
    updateLevelDto: UpdateDegreeTypeDto,
  ): Promise<DegreeType | NotFoundException>;
  remove(
    ids: Array<string>,
  ): Promise<[]> | BadRequestException | NotFoundException;
}
