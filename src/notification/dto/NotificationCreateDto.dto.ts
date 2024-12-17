import { IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class NotificationCreateDto {
  @IsOptional()
  candidateId: number;
  @IsOptional()
  employerId: number;
  @IsOptional()
  applicationId: Types.ObjectId; // Đơn ứng tuyển
  @IsOptional()
  jobId: Types.ObjectId; // Công việc mà ứng viên ứng tuyển
  @IsOptional()
  message: string;
  @IsOptional()
  isRead: boolean;
  @IsOptional()
  createdAt: Date;
  @IsOptional()
  title: string;
}
