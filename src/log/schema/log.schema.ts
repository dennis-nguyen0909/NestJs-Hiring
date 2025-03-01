import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/modules/users/schemas/user.schema';

export type LogDocument = Log & Document;

@Schema({ timestamps: true })
export class Log {
  @Prop({ required: true, ref: User.name })
  userId: Types.ObjectId;

  @Prop({ required: true })
  userRole: string;

  @Prop({
    required: true,
    enum: [
      'CREATE',
      'UPDATE',
      'DELETE',
      'APPLY',
      'SAVE',
      'REJECT',
      'CANCEL',
      'UNFAVORITE',
      'FAVORITE',
      'View',
      'UPLOAD_CV',
      'DELETE_CV',
    ],
  })
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

  @Prop({ type: Object })
  changesLink: {
    link: string;
    name: string;
  };

  @Prop({ type: Object })
  changeColumns: {
    [key: string]: {
      value: any;
    };
  };
}

export const LogSchema = SchemaFactory.createForClass(Log);

// Thêm các index bằng createIndexes
LogSchema.index({ userId: 1 }); // Tạo index cho userId
LogSchema.index({ userId: -1 }); // Tạo index cho userId
LogSchema.index({ userRole: 1 }); // Tạo index cho userRole
LogSchema.index({ userRole: -1 }); // Tạo index cho userRole
LogSchema.index({ action: 1 }); // Tạo index cho action
LogSchema.index({ action: -1 }); // Tạo index cho action
LogSchema.index({ createdAt: -1 }); // Index cho trường createdAt theo thứ tự giảm dần
LogSchema.index({ createdAt: 1 }); // Index cho trường createdAt theo thứ tự giảm dần
