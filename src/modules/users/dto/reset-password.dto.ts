import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Types } from 'mongoose';

export class ResetPasswordDto {
  @IsNotEmpty()
  user_id: Types.ObjectId;

  @IsString()
  current_password: string;

  @IsString()
  @MinLength(6)
  new_password: string;
}
