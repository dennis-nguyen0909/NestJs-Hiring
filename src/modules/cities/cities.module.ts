import { Module } from '@nestjs/common';
import { CitiesService } from './cities.service';
import { CitiesController } from './cities.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Cities, CitiesSchema } from './schema/Cities.schema';
import { DistrictsModule } from '../districts/districts.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Cities.name, schema: CitiesSchema }]),
  ],

  controllers: [CitiesController],
  providers: [CitiesService],
  exports: [CitiesModule],
})
export class CitiesModule {}
