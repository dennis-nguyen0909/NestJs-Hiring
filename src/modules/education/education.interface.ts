import { Education } from './schema/Education.schema';
import { CreateEducationDto } from './dto/create-education.dto';
import { UpdateEducationDto } from './dto/update-education.dto';
import { BadRequestException } from '@nestjs/common';
import { Meta } from '../types';

export interface IEducationService {
  addEducation(
    createEducationDto: CreateEducationDto,
  ): Promise<Education | BadRequestException>;
  findEducationsByUserId(userId: string): Promise<Education[]>;
  findAll(
    query: string,
    current: number,
    pageSize: number,
  ): Promise<{ items: Education[]; meta: Meta }>;
  findOne(id: string): Promise<Education | BadRequestException>;
  updateByUserId(
    id: string,
    updateEducationDto: UpdateEducationDto,
    userId: string,
  ): Promise<Education>;
  deleteByUserId(id: string, userId: string): Promise<[]>;
}
