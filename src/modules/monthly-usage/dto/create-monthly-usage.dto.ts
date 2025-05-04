import { IsString, IsNumber, IsDate, IsMongoId } from 'class-validator';

export class CreateMonthlyUsageDto {
  @IsMongoId()
  userId: string;

  @IsMongoId()
  purchaseHistoryId: string;

  @IsString()
  yearMonth: string;

  @IsNumber()
  jobsPosted: number;

  @IsNumber()
  resumesViewed: number;

  @IsDate()
  resetDate: Date;

  @IsNumber()
  featuredJobsUsed: number;

  @IsNumber()
  jobRefreshesUsed: number;

  @IsNumber()
  directContactsUsed: number;
}
