import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
@Schema({ timestamps: true })
export class CVUploads extends Document {
  @Prop({ type: String, required: true })
  cv_id: string;

  @Prop({ type: [String], required: true })
  cv_url: string[];

  @Prop({ type: String, required: true })
  file_name: string;

  @Prop({ type: Date, required: true })
  created_at: Date;

  @Prop({ type: Date })
  updated_at: Date;
}

export const CVUploadsSchema = SchemaFactory.createForClass(CVUploads);
