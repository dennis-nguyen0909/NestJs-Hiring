import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Course } from './schema/course.schema';
import { Meta } from '../types';

export interface ICourseService {
  create(createCourseDto: CreateCourseDto): Promise<Course>;
  findAll(
    query: string,
    current: number,
    pageSize: number,
  ): Promise<{ items: Course[]; meta: Meta }>;
  findOne(id: string): Promise<Course>;
  update(id: string, updateCourseDto: UpdateCourseDto): Promise<Course>;
  remove(id: string, userId: string): Promise<void>;
}
