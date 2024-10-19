import { Module } from '@nestjs/common';
import { MajorService } from './major.service';
import { MajorController } from './major.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Major, MajorSchema } from './schema/Major.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Major.name,
        schema: MajorSchema,
      },
    ]),
  ],
  controllers: [MajorController],
  providers: [MajorService],
})
export class MajorModule {}
