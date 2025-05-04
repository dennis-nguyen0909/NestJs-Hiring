import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PurchaseHistoryService } from './purchase-history.service';
import { PurchaseHistoryController } from './purchase-history.controller';
import {
  PurchaseHistory,
  PurchaseHistorySchema,
} from './purchase-history.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PurchaseHistory.name, schema: PurchaseHistorySchema },
    ]),
  ],
  controllers: [PurchaseHistoryController],
  providers: [PurchaseHistoryService],
  exports: [PurchaseHistoryService],
})
export class PurchaseHistoryModule {}
