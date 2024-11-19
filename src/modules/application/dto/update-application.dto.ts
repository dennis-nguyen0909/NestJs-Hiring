import { PartialType } from '@nestjs/mapped-types';
import { CreateApplicationDto } from './create-application.dto';
import { IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class UpdateApplicationDto extends PartialType(CreateApplicationDto) {
  @IsOptional()
  save_candidates?: Types.ObjectId[];
}
