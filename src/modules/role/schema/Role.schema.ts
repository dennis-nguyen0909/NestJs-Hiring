import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Role extends Document {
  @Prop({ required: true, enum: ['ADMIN', 'EMPLOYER', 'USER'] })
  role_name: string;

  @Prop()
  role_permission: Array<string>;
}

export const RoleSchema = SchemaFactory.createForClass(Role);
