import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class CreatePrizeDto {
  @IsNotEmpty()
  user_id: Types.ObjectId;
  @IsString()
  @IsNotEmpty()
  prize_name: string;
  @IsString()
  @IsNotEmpty()
  organization_name: string;
  @IsOptional()
  date_of_receipt?: Date;
  @IsOptional()
  @IsString()
  prize_link?: string;
  @IsOptional()
  @IsString()
  prize_image?: string;
}
