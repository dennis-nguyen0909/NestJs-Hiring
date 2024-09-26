import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class AuthProvider extends Document {
  @Prop({ required: true })
  provider_name: string;

  @Prop({ required: true })
  provider_id: string;
}

export const AuthProviderSchema = SchemaFactory.createForClass(AuthProvider);
