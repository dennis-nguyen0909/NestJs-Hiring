import { Module } from '@nestjs/common';
import { CvUploadService } from './cv-upload.service';
import { CvUploadController } from './cv-upload.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CVUploads, CVUploadsSchema } from './schema/CvUploads.schema';
import { UsersModule } from '../users/users.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CVUploads.name, schema: CVUploadsSchema },
    ]),
    CloudinaryModule,
    UsersModule,
  ],
  controllers: [CvUploadController],
  providers: [CvUploadService],
  exports: [CvUploadService, CvUploadModule],
})
export class CvUploadModule {}
