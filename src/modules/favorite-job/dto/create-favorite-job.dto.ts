import { IsMongoId, IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';

export class CreateFavoriteJobDto {
  @IsNotEmpty()
  // @IsMongoId()
  user_id: Types.ObjectId;

  @IsNotEmpty()
  // @IsMongoId()
  job_id: Types.ObjectId;
}
