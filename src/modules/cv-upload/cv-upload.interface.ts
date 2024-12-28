// src/cv-uploads/interfaces/cv-upload.interface.ts

import { Meta } from '../types';
import { CVUploads } from './schema/CvUploads.schema';

export interface ICvUploadService {
  create(file: Express.Multer.File, userId: string): Promise<CVUploads>;
  findOne(id: string): Promise<CVUploads>;
  findByUserId(id: string): Promise<any>;
  findAll(
    query: string,
    current: number,
    pageSize: number,
  ): Promise<{ items: CVUploads[]; meta: Meta }>;
  removeByUserId(cvId: string, userId: string): Promise<[]>;
  removeMany(ids: Array<string>): Promise<[]>;
}
