import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Education } from '../../education/schema/Education.schema';
import { WorkExperience } from '../../work-experience/schema/WorkExperience.schema';
import { Skill } from '../../skill/schema/Skill.schema';
import { User } from '../../users/schemas/User.schema';

@Schema()
export class CV extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ type: Types.ObjectId, ref: User.name })
  user: string;

  @Prop()
  personal_info: string;

  @Prop([{ type: Types.ObjectId, ref: Education.name }])
  education: Education[];

  @Prop([{ type: Types.ObjectId, ref: WorkExperience.name }])
  work_experience: WorkExperience[];

  @Prop([{ type: Types.ObjectId, ref: Skill.name }])
  skills: Skill[];

  @Prop([String])
  languages: string[];
}

export const CVSchema = SchemaFactory.createForClass(CV);
