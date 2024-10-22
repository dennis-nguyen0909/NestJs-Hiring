import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/User.schema';
import { Job } from '../../job/schema/Job.schema';
import { CV } from '../../cv/schema/CV.schema';
import { ApiProperty } from '@nestjs/swagger';

@Schema()
export class Application extends Document {
  @ApiProperty({
    description: 'User id',
    example: 'user1',
  })
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  user_id: string;
  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: Job.name, required: true })
  job_id: string;
  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  employer_id: string;
  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: CV.name, required: true })
  cv_id: string;
  @ApiProperty()
  @Prop({ required: true })
  cover_letter: string;
  @ApiProperty()
  @Prop({ type: Date, default: Date.now })
  applied_date: Date;
  @ApiProperty()
  @Prop({
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  })
  status: string;
}

export const ApplicationSchema = SchemaFactory.createForClass(Application);
