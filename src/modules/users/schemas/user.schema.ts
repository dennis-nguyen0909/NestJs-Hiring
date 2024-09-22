import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Role } from './Role.schema';
import { AuthProvider } from './AuthProvider.schema';
import { CV } from './CV.schema';

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

  @Prop({ required: true })
  password: string;

  @Prop({ default: '' })
  address: string;

  @Prop()
  gender: string;
  @Prop({ type: Types.ObjectId, ref: Role.name, default: 'USERS' })
  role: Role;

  @Prop({ default: 'LOCAL' })
  account_type: string;

  @Prop()
  token_expiry: Date;

  @Prop({ default: false })
  is_active: boolean;

  @Prop()
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
}

export const UserSchema = SchemaFactory.createForClass(User);
