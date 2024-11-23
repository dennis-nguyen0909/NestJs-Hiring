import { Module } from '@nestjs/common';
import { CvService } from './cv.service';
import { CvController } from './cv.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CV, CVSchema } from './schema/CV.schema';
import { UsersModule } from '../users/users.module';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: CV.name, schema: CVSchema }]),
    UsersModule,
    CloudinaryModule,
  ],
  controllers: [CvController],
  providers: [CvService],
})
export class CvModule {}
