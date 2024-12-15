import { IsNotEmpty, IsOptional } from 'class-validator';

export class RegisterAuthDto {
  @IsNotEmpty({ message: 'Email is required.' })
  email: string;

  @IsNotEmpty({ message: 'Password is required.' })
  password: string;

  @IsNotEmpty({ message: 'Full name is required.' })
  full_name: string;

  @IsNotEmpty({ message: 'Role is required.' })
  role: string;

  @IsOptional()
  company_name?: string;
  @IsOptional()
  website?: string;
  @IsOptional()
  location?: string;
  @IsOptional()
  description?: string;

  @IsOptional()
  authProvider?: string;
}
