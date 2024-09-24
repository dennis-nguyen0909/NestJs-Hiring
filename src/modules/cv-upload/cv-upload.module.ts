import { Module } from '@nestjs/common';
import { CvUploadService } from './cv-upload.service';
import { CvUploadController } from './cv-upload.controller';

@Module({
  controllers: [CvUploadController],
  providers: [CvUploadService],
})
export class CvUploadModule {}
