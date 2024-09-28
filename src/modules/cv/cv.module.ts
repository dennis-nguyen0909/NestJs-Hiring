import { Module } from '@nestjs/common';
import { CvService } from './cv.service';
import { CvController } from './cv.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CV, CVSchema } from './schema/CV.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: CV.name, schema: CVSchema }])],
  controllers: [CvController],
  providers: [CvService],
})
export class CvModule {}
