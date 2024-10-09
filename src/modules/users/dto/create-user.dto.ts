import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: "User's full name",
    example: 'Minh duy',
  })
  @IsNotEmpty({ message: 'Full name is required.' })
  @IsString()
  full_name: string;

  @ApiProperty({
    description: "User's email",
    example: 'dennis.nguyen0909@gmail.com',
  })
  @IsNotEmpty({ message: 'Email is required.' })
  @IsEmail()
  email: string;
  @ApiProperty({
    description: 'Password of user',
    example: '123123',
  })
  @IsString()
  username: string;
  @IsNotEmpty({ message: 'Password is required.' })
  @IsString()
  password: string;

  @ApiProperty({
    description: 'Role of users',
    example: 'USER',
  })
  @IsNotEmpty()
  @IsString()
  role: string;
  @IsString()
  @IsOptional()
  company_name?: string;
  @IsString()
  @IsOptional()
  website?: string;
  @IsString()
  @IsOptional()
  location?: string;
  @IsString()
  @IsOptional()
  description?: string;
}
