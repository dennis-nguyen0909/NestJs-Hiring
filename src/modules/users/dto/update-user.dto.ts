import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsMongoId, IsNotEmpty, IsOptional, IsString, IsPhoneNumber } from 'class-validator';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['password']),
) {
  @IsMongoId({ message: 'Id is not valid' })
  @IsNotEmpty({ message: 'Id is required' })
  _id: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  gender?: string;
}
