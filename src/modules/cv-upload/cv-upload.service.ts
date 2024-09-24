import { Injectable } from '@nestjs/common';
import { CreateCvUploadDto } from './dto/create-cv-upload.dto';
import { UpdateCvUploadDto } from './dto/update-cv-upload.dto';

@Injectable()
export class CvUploadService {
  create(createCvUploadDto: CreateCvUploadDto) {
    return 'This action adds a new cvUpload';
  }

  findAll() {
    return `This action returns all cvUpload`;
  }

  findOne(id: number) {
    return `This action returns a #${id} cvUpload`;
  }

  update(id: number, updateCvUploadDto: UpdateCvUploadDto) {
    return `This action updates a #${id} cvUpload`;
  }

  remove(id: number) {
    return `This action removes a #${id} cvUpload`;
  }
}
