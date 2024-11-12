import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { CV } from '../../cv/schema/CV.schema';
import { User } from 'src/modules/users/schemas/User.schema';
import { ApiProperty, ApiTags } from '@nestjs/swagger';

@ApiTags('Education')
@Schema({ timestamps: true })
export class Education extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  user_id: Types.ObjectId;
  @ApiProperty({
    description: 'User id',
    example: 'user1',
  })
  @ApiProperty({
    description: 'School name',
    example: 'Đại học công nghệ Sài Gòn',
  })
  @Prop({ required: true })
  school: string;

  @ApiProperty({
    description: 'Degree',
    example: 'Degree University',
  })
  @Prop()
  degree: string;

  @ApiProperty({
    description: 'Major',
    example: 'Software Engineer',
  })
  @Prop({ required: true })
  major: string;
  @ApiProperty({
    description: 'Start date',
    example: '2022-01-01',
  })
  @Prop({ required: true })
  start_date: Date;

  @ApiProperty({
    description: 'End date',
    example: '2025-01-01',
  })
  @Prop()
  end_date: Date;

  @Prop()
  currently_studying: boolean;
}

export const EducationSchema = SchemaFactory.createForClass(Education);
