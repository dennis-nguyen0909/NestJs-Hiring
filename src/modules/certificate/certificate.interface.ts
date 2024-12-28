import { CreateCertificateDto } from './dto/create-certificate.dto';
import { UpdateCertificateDto } from './dto/update-certificate.dto';
import { Certificate } from './schema/certificate.schema';
import { Meta } from '../types';

export interface ICertificateServiceInterface {
  create(createCertificateDto: CreateCertificateDto): Promise<Certificate>;
  findOne(id: string): Promise<Certificate>;
  update(
    id: string,
    updateCertificateDto: UpdateCertificateDto,
  ): Promise<Certificate>;
  remove(id: string, userId: string): Promise<void>;
  findAll(
    query: string,
    current: number,
    pageSize: number,
  ): Promise<{ items: Certificate[]; meta: Meta }>;
}
