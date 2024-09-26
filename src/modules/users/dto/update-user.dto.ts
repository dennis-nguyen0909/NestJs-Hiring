import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import {
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsPhoneNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['password']),
) {
  @ApiProperty()
  @IsMongoId({ message: 'Id is not valid' })
  @IsNotEmpty({ message: 'Id is required' })
  _id: string;
  @ApiProperty()
  @IsOptional()
  @IsString()
  avatar?: string;
  @ApiProperty()
  @IsOptional()
  phone?: string;
  @ApiProperty()
  @IsOptional()
  @IsString()
  address?: string;
  @ApiProperty()
  @IsOptional()
  @IsString()
  gender?: string;
}
