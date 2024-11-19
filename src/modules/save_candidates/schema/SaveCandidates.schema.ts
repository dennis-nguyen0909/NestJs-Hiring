import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/modules/users/schemas/User.schema';


@Schema({ timestamps: true })
export class SaveCandidate extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  employer: User; // Tham chiếu đến nhà tuyển dụng (Employer)

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  candidate: User; // Tham chiếu đến ứng viên (Candidate)

  @Prop({ type: Boolean, default: true })
  isActive: boolean; // Trạng thái của việc lưu ứng viên
}

export const SaveCandidateSchema = SchemaFactory.createForClass(SaveCandidate);
