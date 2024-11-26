import { Types } from 'mongoose';
import { IsNotEmpty } from 'class-validator';

export class CreateCvDto {
  @IsNotEmpty()
  user_id: Types.ObjectId;
  @IsNotEmpty()
  cv_name: string;
  @IsNotEmpty()
  cv_link: string;
  @IsNotEmpty()
  public_id: string;

  @IsNotEmpty()
  bytes: number;
}
