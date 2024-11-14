import { Module } from '@nestjs/common';
import { CitiesService } from './cities.service';
import { CitiesController } from './cities.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Cities, CitiesSchema } from './schema/Cities.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Cities.name, schema: CitiesSchema }]),
  ],
  controllers: [CitiesController],
  providers: [CitiesService],
})
export class CitiesModule {}
