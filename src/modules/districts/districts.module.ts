import { Module } from '@nestjs/common';
import { DistrictsService } from './districts.service';
import { DistrictsController } from './districts.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { District, DistrictSchema } from './schema/District.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: District.name, schema: DistrictSchema },
    ]),
  ],
  controllers: [DistrictsController],
  providers: [DistrictsService],
  exports: [DistrictsModule],
})
export class DistrictsModule {}
