import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Certificate {
  @Prop({ required: true })
  certificate_name: string;

  @Prop({ required: true })
  organization_name: string;

  @Prop()
  start_date: Date;

  @Prop()
  end_date: Date;

  @Prop({ default: false })
  is_not_expired: boolean;

  @Prop()
  img_certificate: string;

  @Prop()
  link_certificate: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  candidate_id: Types.ObjectId;
}

export const CertificateSchema = SchemaFactory.createForClass(Certificate);
