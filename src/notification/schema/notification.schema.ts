import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Application } from 'src/modules/application/schema/Application.schema';
import { Job } from 'src/modules/job/schema/Job.schema';
import { User } from 'src/modules/users/schemas/User.schema';
@Schema({ timestamps: true })
export class Notification extends Document {
  @Prop({ type: Types.ObjectId, ref: User.name })
  candidateId: number;

  @Prop({ type: Types.ObjectId, ref: User.name })
  employerId: number;

  @Prop()
  title: string;
  @Prop({ type: Types.ObjectId, ref: Application.name }) // Tham chiếu tới Application schema
  applicationId: Types.ObjectId; // Đơn ứng tuyển

  @Prop({ type: Types.ObjectId, ref: Job.name }) // Tham chiếu tới Job schema nếu cần
  jobId: Types.ObjectId; // Công việc mà ứng viên ứng tuyển
  @Prop()
  message: string;

  @Prop({ default: false })
  isRead: boolean;

  @Prop()
  createdAt: Date;
  @Prop({
    enum: [
      'view_resume',
      'cv_accepted',
      'cv_rejected',
      'new_job_posted',
      'interview_scheduled',
      'interview_completed',
      'application_withdrawn',
      'job_application_updated',
      'job_application_status_changed',
      'job_deadline_approaching',
      'job_filled',
      'job_post_deleted',
      'new_message',
      'profile_updated',
      'job_saved',
      'application_shortlisted',
    ],
    required: true,
  })
  type: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
