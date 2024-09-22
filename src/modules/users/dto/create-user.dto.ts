import {
  IsEmail,
  IsEmpty,
  IsNotEmpty,
  IsString,
  ValidateIf,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Full name is required.' })
  @IsString()
  full_name: string;
  @IsNotEmpty({ message: 'Email is required.' })
  @IsEmail()
  email: string;
  
  phone: string;

  @IsNotEmpty({ message: 'Password is required.' })
  @IsString()
  password: string;
}
