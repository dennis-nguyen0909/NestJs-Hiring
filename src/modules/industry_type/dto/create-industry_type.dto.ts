/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ObjectId } from 'mongoose';

export class CreateIndustryTypeDto {
  @IsNotEmpty()
  @IsString()
  name: string;
  @IsOptional()
  key?: string;
  @IsOptional()
  description?: string;

  @IsNotEmpty()
  user_id: ObjectId;
}
