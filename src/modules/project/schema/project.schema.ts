import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Date, Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Project extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;
  @Prop()
  project_name: string;
  @Prop()
  customer_name: string;
  @Prop()
  team_number: number;
  @Prop()
  location: string;
  @Prop()
  mission: string;
  @Prop()
  technology: string;
  @Prop({ type: Date })
  start_date: Date;
  @Prop({ type: Date })
  end_date: Date;
  @Prop()
  project_link: string;
  @Prop()
  project_image: string;
  @Prop()
  descroption: string;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
