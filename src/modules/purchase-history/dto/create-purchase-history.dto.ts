import {
  IsString,
  IsNumber,
  IsDate,
  IsEnum,
  IsMongoId,
  IsOptional,
} from 'class-validator';
import { PaymentStatus } from '../purchase-history.schema';

export class CreatePurchaseHistoryDto {
  @IsMongoId()
  userId: string;

  @IsMongoId()
  packageId: string;

  @IsString()
  packageName: string;

  @IsNumber()
  packagePrice: number;

  @IsDate()
  purchaseDate: Date;

  @IsDate()
  startDate: Date;

  @IsDate()
  endDate: Date;

  @IsString()
  paymentMethod: string;

  @IsEnum(PaymentStatus)
  @IsOptional()
  paymentStatus?: PaymentStatus;

  @IsString()
  @IsOptional()
  transactionId?: string;
}
