import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { DeleteCvDto } from './dto/delete-cv.dto';
import { CV } from './schema/CV.schema';
import { Buffer } from 'buffer';
import { Meta } from '../types';
import { Request } from 'express';

export interface ICvService {
  create(createCvDto: CreateCvDto,req:Request): Promise<CV>;
  findAll(query: string, current: number, pageSize: number): Promise<any>;
  findOne(id: string): Promise<CV | null>;
  update(
    id: string,
    updateCvDto: UpdateCvDto,
  ): Promise<{ message: string; data: CV }>;
  remove(
    data: DeleteCvDto,
    userId: string,
    req: Request,
  ): Promise<{ message: string; data: any[] }>;
  findCvByUserId(
    id: string,
    query: string,
    current: number,
    pageSize: number,
  ): Promise<{ data: { items: CV[]; meta: Meta } }>;
  generalPDF(id: string): Promise<Buffer>;
  downloadPFD(): Promise<any>;
  delete(id: string, userId: string, req: Request): Promise<void>;
}
