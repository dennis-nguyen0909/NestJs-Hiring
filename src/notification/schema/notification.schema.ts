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
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
