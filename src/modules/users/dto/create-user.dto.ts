import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: "User's full name",
    example: 'Minh Duy',
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
    description: 'Username of user',
    example: 'minhduy',
  })
  @IsNotEmpty({ message: 'Username is required.' })
  @IsString()
  username: string;

  @ApiProperty({
    description: 'Password of user',
    example: '123123',
  })
  @IsNotEmpty({ message: 'Password is required.' })
  @IsString()
  password: string;

  @ApiProperty({
    description: 'Role of the user',
    example: 'USER',
  })
  @IsNotEmpty({ message: 'Role is required.' })
  @IsString()
  role: string;

  @ApiProperty({
    description: 'Name of the company the user is associated with (optional)',
    example: 'ABC Corp',
    required: false,
  })
  @IsString()
  @IsOptional()
  company_name?: string;

  @ApiProperty({
    description: 'Website of the user (optional)',
    example: 'https://example.com',
    required: false,
  })
  @IsString()
  @IsOptional()
  website?: string;

  @ApiProperty({
    description: 'Location of the user (optional)',
    example: 'Ho Chi Minh City, Vietnam',
    required: false,
  })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({
    description: 'Description about the user (optional)',
    example: 'Software engineer with 5 years of experience.',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
