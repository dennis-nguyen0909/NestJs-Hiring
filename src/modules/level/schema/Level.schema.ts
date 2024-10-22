import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Level extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  key: string;
  
  @Prop()
  description: string;
}

export const LevelSchema = SchemaFactory.createForClass(Level);
