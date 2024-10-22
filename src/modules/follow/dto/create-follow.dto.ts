import { IsNotEmpty, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class CreateFollowDto {
  @IsNotEmpty()
  following_id: Types.ObjectId;

  @IsNotEmpty()
  follower_id: Types.ObjectId;

  @IsOptional()
  follow_date: Date;
}
