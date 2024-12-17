import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class TeamSize extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  key: string;

  @Prop()
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'Users' })
  user_id: Types.ObjectId;
}

export const TeamSizeSchema = SchemaFactory.createForClass(TeamSize);