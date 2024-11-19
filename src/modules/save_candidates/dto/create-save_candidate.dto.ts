import { IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';

export class CreateSaveCandidateDto {
  @IsNotEmpty()
  employer: Types.ObjectId;
  @IsNotEmpty()
  candidate: Types.ObjectId;
  @IsNotEmpty()
  isActive: boolean;
}
