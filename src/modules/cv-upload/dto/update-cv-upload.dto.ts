import { PartialType } from '@nestjs/mapped-types';
import { CreateCvUploadDto } from './create-cv-upload.dto';

export class UpdateCvUploadDto extends PartialType(CreateCvUploadDto) {}
