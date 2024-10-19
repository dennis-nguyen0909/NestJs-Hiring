import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Education } from '../../education/schema/Education.schema';
import { WorkExperience } from '../../work-experience/schema/WorkExperience.schema';
import { Skill } from '../../skill/schema/Skill.schema';
import { User } from '../../users/schemas/User.schema';

@Schema({ timestamps: true })
export class CV extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ type: Types.ObjectId, ref: User.name })
  user_id: string;

  @Prop()
  personal_info: string;

  @Prop([{ type: Types.ObjectId, ref: 'Education' }])
  education: Education[];

  @Prop([{ type: Types.ObjectId, ref: WorkExperience.name }])
  work_experience: WorkExperience[];

  @Prop([{ type: Types.ObjectId, ref: Skill.name }])
  skills: Skill[];

  @Prop([String])
  languages: string[];

  // Fields from CVUploads
  @Prop({ type: [String], required: true })
  cv_url: string[];

  // @Prop({ type: String, required: true })
  // file_name: string;

  // Timestamps are automatically added with the 'timestamps' option in @Schema
}

export const CVSchema = SchemaFactory.createForClass(CV);
