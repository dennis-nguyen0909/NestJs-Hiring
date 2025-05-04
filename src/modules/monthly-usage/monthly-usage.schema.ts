import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../users/schemas/user.schema';
import { PurchaseHistory } from '../purchase-history/purchase-history.schema';

export type MonthlyUsageDocument = MonthlyUsage & Document;

@Schema({ timestamps: true })
export class MonthlyUsage {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: User;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'PurchaseHistory',
    required: true,
  })
  purchaseHistoryId: PurchaseHistory;

  @Prop({ required: true })
  yearMonth: string;

  @Prop({ default: 0 })
  jobsPosted: number;

  @Prop({ default: 0 })
  resumesViewed: number;

  @Prop({ required: true })
  resetDate: Date;

  // Additional usage tracking
  @Prop({ default: 0 })
  featuredJobsUsed: number;

  @Prop({ default: 0 })
  jobRefreshesUsed: number;

  @Prop({ default: 0 })
  directContactsUsed: number;
}

export const MonthlyUsageSchema = SchemaFactory.createForClass(MonthlyUsage);
