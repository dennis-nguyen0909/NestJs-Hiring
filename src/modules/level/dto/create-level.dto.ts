import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ObjectId } from 'mongoose';

export class CreateLevelDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string;
  @IsOptional()
  @IsString()
  key?: string;

  @IsNotEmpty()
  user_id: ObjectId;
}
