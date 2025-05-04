import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../users/schemas/user.schema';
import { Package } from '../package/package.schema';

export type PurchaseHistoryDocument = PurchaseHistory & Document;

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

@Schema({ timestamps: true })
export class PurchaseHistory {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Package', required: true })
  packageId: Package;

  @Prop({ required: true })
  packageName: string;

  @Prop({ required: true })
  packagePrice: number;

  @Prop({ required: true })
  purchaseDate: Date;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ required: true })
  paymentMethod: string;

  @Prop({
    type: String,
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  @Prop({ default: null })
  transactionId: string;

  @Prop({ default: null })
  lastUsageReset: Date;
}

export const PurchaseHistorySchema =
  SchemaFactory.createForClass(PurchaseHistory);
