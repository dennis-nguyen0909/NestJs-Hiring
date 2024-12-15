import { Module } from '@nestjs/common';
import { IndustryTypeService } from './industry_type.service';
import { IndustryTypeController } from './industry_type.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  IndustryType,
  IndustryTypeSchema,
} from './schema/industry_type.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: IndustryType.name,
        schema: IndustryTypeSchema,
      },
    ]),
  ],
  controllers: [IndustryTypeController],
  providers: [IndustryTypeService],
})
export class IndustryTypeModule {}
