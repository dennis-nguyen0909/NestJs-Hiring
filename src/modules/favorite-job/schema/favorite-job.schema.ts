import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Job } from 'src/modules/job/schema/Job.schema';
import { User } from 'src/modules/users/schemas/user.schema';

@Schema({ timestamps: true })
export class FavoriteJob {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  user_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Job.name })
  job_id: Types.ObjectId;
}

export const FavoriteJobSchema = SchemaFactory.createForClass(FavoriteJob);
