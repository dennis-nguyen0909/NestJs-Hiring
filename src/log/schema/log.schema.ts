import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/modules/users/schemas/user.schema';

export type LogDocument = Log & Document;

@Schema({ timestamps: true })
export class Log {
  @Prop({ required: true, ref: User.name })
  userId: Types.ObjectId;

  @Prop({ required: true, enum: ['CREATE', 'UPDATE', 'DELETE'] })
  action: string;

  @Prop({ required: true })
  entityId: string;

  @Prop({ required: true })
  entityCollection: string;

  @Prop({ type: Object })
  description: string;

  @Prop({ type: Object })
  changes: {
    [key: string]: {
      new: string | Types.ObjectId;
      old: string | Types.ObjectId;
    };
  };

  @Prop()
  ipAddress: string;

  @Prop({ type: Object })
  deviceInfo: {
    os: {
      name: string;
      version: string;
    };
    device: {
      model: string;
      type: string;
      vendor: string;
    };
    browser: {
      name: string;
      version: string;
    };
    engine: {
      name: string;
      version: string;
    };
  };

  @Prop()
  activityDetail: string;

  @Prop()
  entityName: string;
}

export const LogSchema = SchemaFactory.createForClass(Log);
