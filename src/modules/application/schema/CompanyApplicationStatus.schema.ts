import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { ApiProperty } from '@nestjs/swagger';

@Schema({ timestamps: true })
export class CompanyApplicationStatus extends Document {
  @ApiProperty({
    description: 'Company ID that owns these statuses',
    example: 'company1',
  })
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  company_id: Types.ObjectId;

  @ApiProperty({
    description: 'Name of the status',
    example: 'Review CV',
  })
  @Prop({ required: true })
  name: string;

  @ApiProperty({
    description: 'Description of what this status means',
    example: 'CV is being reviewed by the hiring team',
  })
  @Prop()
  description: string;

  @ApiProperty({
    description: 'Order in which this status appears in the workflow',
    example: 1,
  })
  @Prop({ required: true, default: 0 })
  order: number;

  @ApiProperty({
    description: 'Color code for the status (for UI display)',
    example: '#FF0000',
  })
  @Prop({ default: '#000000' })
  color: string;

  @ApiProperty({
    description: 'Whether this status is active',
    example: true,
  })
  @Prop({ default: true })
  is_active: boolean;
}

export const CompanyApplicationStatusSchema = SchemaFactory.createForClass(
  CompanyApplicationStatus,
);
