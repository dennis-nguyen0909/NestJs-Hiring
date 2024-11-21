import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/modules/users/schemas/User.schema';

@Schema({ timestamps: true })
export class Organization extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: User; // Chỉ định người sở hữu tổ chức (User)

  @Prop({ required: true, type: String })
  industry_type: string; // Loại ngành nghề của tổ chức

  @Prop({ required: true, type: String })
  organization_type: string; // Loại ngành nghề của tổ chức

  @Prop({ required: true, type: String })
  year_of_establishment: string; // Năm thành lập tổ chức

  @Prop({ required: true, type: String })
  team_size: string; // Kích thước đội ngũ (ví dụ: "5-10 người" hoặc "50-100 người")

  @Prop({ required: true, type: String })
  company_website: string; // Website của tổ chức

  @Prop({ required: true, type: String })
  company_vision: string; // Tầm nhìn của công ty

  @Prop({ required: false, type: String })
  social_facebook: string; // Liên kết đến Facebook của tổ chức

  @Prop({ required: false, type: String })
  social_instagram: string; // Liên kết đến Instagram của tổ chức

  @Prop({ required: false, type: String })
  social_linkedin: string; // Liên kết đến LinkedIn của tổ chức

  @Prop({ required: false, type: String })
  social_twitter: string; // Liên kết đến Twitter của tổ chức

  @Prop({ required: false, type: String })
  social_youtube: string; // Liên kết đến YouTube của tổ chức
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);
