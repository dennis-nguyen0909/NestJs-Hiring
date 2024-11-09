import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Job } from '../../job/schema/Job.schema'; // Nhớ import Job schema
import { Role } from '../../role/schema/Role.schema';
import { AuthProvider } from '../../auth-provider/schema/AuthProvider.schema';
import { CV } from '../../cv/schema/CV.schema';
import { Education } from 'src/modules/education/schema/Education.schema';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  full_name: string;

  @Prop({ default: '', unique: false, sparse: true })
  phone: string;

  @Prop()
  avatar: string;

  @Prop()
  background: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: '' })
  address: string;

  @Prop()
  gender: string;

  @Prop({ type: Types.ObjectId, ref: Role.name, default: null })
  role: Role; // Phân biệt người dùng qua role (ADMIN, USERS, EMPLOYER, ...)

  @Prop({ default: 'LOCAL' })
  account_type: string;

  @Prop()
  token_expiry: Date;

  @Prop({ default: false })
  is_active: boolean;

  @Prop({ default: false })
  is_search_jobs_status: boolean;

  @Prop()
  code_id: string;

  @Prop()
  code_expired: Date;

  @Prop([{ type: Types.ObjectId, ref: AuthProvider.name }])
  auth_providers: AuthProvider[];

  @Prop([String])
  save_job_ids: string[];

  @Prop([{ type: Types.ObjectId, ref: 'CV' }])
  cvs: CV[];

  @Prop([{ type: Types.ObjectId, ref: Education.name }])
  education_ids: Types.ObjectId[];

  // Các thuộc tính dành cho Employer (Nhà tuyển dụng)
  @Prop({ required: false })
  company_name?: string;

  @Prop({ required: false })
  website?: string;

  @Prop({ required: false })
  location?: string;

  @Prop([{ type: Types.ObjectId, ref: Job.name, required: false }])
  jobs_ids?: Job[];

  @Prop({ required: false })
  description?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
