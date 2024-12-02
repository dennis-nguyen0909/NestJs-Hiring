import { IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';

export class CreateSocialLinkDto {
  @IsNotEmpty()
  user_id: Types.ObjectId;
  @IsNotEmpty()
  type: string;
  @IsNotEmpty()
  url: string;
}
