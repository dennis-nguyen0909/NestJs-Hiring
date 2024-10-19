import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Document } from 'mongoose';
@Schema({ timestamps: true })
export class CVUploads extends Document {
  @Prop({ type: ObjectId, required: true, index: true })
  user_id: string;

  @Prop({ type: String, required: true })
  cv_id: string;

  @Prop({ type: String, required: true })
  cv_url: string;

  @Prop({ type: String, required: true })
  file_name: string;

  @Prop()
  public_id?:string;
}

export const CVUploadsSchema = SchemaFactory.createForClass(CVUploads);
