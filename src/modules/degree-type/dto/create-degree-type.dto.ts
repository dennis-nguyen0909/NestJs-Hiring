import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ObjectId } from 'mongoose';

export class CreateDegreeTypeDto {
  @IsNotEmpty()
  @IsString()
  name: string;
  @IsOptional()
  key: string;
  @IsOptional()
  description?: string;

  @IsNotEmpty()
  user_id: ObjectId;
}
