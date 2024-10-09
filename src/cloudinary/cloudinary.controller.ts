import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Public } from 'src/decorator/customize';
import { ApiTags } from '@nestjs/swagger';

@Controller('cloudinary')
@Public()
@ApiTags('Cloudinary')
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  // Upload một file
  @Post('upload-file') // Đặt route là /cloudinary/upload-file
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File): Promise<string> {
    return this.cloudinaryService.uploadFile(file);
  }

  // Upload nhiều file
  @Post('upload-files') // Đặt route là /cloudinary/upload-files
  @UseInterceptors(FilesInterceptor('files')) // Đặt tên field upload là 'files'
  uploadFiles(
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<string[]> {
    return this.cloudinaryService.uploadFiles(files);
  }
}