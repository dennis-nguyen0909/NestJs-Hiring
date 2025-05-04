import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MonthlyUsageService } from './monthly-usage.service';
import { MonthlyUsageController } from './monthly-usage.controller';
import { MonthlyUsage, MonthlyUsageSchema } from './monthly-usage.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MonthlyUsage.name, schema: MonthlyUsageSchema },
    ]),
  ],
  controllers: [MonthlyUsageController],
  providers: [MonthlyUsageService],
  exports: [MonthlyUsageService],
})
export class MonthlyUsageModule {}
