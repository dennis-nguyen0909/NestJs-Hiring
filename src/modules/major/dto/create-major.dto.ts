import { Optional } from '@nestjs/common';
import { IsAlpha, IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreateMajorDto {
  @IsString()
  @IsNotEmpty()
  name: string;
  @IsString()
  @Optional()
  description?: string;
}

export class DeleteMarjorDto {
  @IsArray()
  ids: Array<string>;
}
