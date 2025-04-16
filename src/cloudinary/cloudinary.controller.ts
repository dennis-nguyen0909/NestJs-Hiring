import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
  UploadedFile,
  Delete,
  Param,
  Get,
  Body,
  Patch,
} from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Public, ResponseMessage } from 'src/decorator/customize';
import { ApiTags } from '@nestjs/swagger';

@Controller('media')
@Public()
@ApiTags('Media')
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  // Upload một file
  @Post('upload-file') // Đặt route là /cloudinary/upload-file
  @UseInterceptors(FileInterceptor('file'))
  @ResponseMessage('Success')
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ url: string; originalName: string; result: any }> {
    return this.cloudinaryService.uploadFile(file);
  }

  // Upload nhiều file
  @Post('upload-files') // Đặt route là /cloudinary/upload-files
  @UseInterceptors(FilesInterceptor('files')) // Đặt tên field upload là 'files'
  @ResponseMessage('Success')
  uploadFiles(
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<{ url: string; originalName: string }[]> {
    return this.cloudinaryService.uploadFiles(files);
  }
  @Delete('delete-file/:publicId')
  @ResponseMessage('Success')
  deleteFile(@Param('publicId') publicId: string) {
    return this.cloudinaryService.deleteFile(publicId);
  }

  @Delete('delete-file-pdf')
  @ResponseMessage('Success')
  deleteFilePDF(@Body() body: { publicId: string }) {
    return this.cloudinaryService.deleteFileResourceType(body.publicId, {
      resource_type: 'raw',
    });
  }

  @Post('upload-pdf')
  @UseInterceptors(FileInterceptor('file'))
  @ResponseMessage('Success')
  uploadPDF(
    @UploadedFile() file: Express.Multer.File,
    @Body('userId') userId: string,
  ) {
    return this.cloudinaryService.uploadPDF(file, userId);
  }

  @Get('folder')
  @UseInterceptors(FileInterceptor('file'))
  @ResponseMessage('Success')
  getFolder(
    @Body('folder') folderName: string,
    @Body('type') type: string,
    @Body('resource_type') resourceType: string,
  ) {
    return this.cloudinaryService.getFolder(folderName, type, resourceType);
  }

  @Patch('rename')
  @ResponseMessage('Success')
  async renamePDF(
    @Body() body: { oldPublicId: string; newFileName: string; userId: string },
  ) {
    const result = await this.cloudinaryService.renamePDF(
      body.oldPublicId,
      body.newFileName,
      body.userId,
    );
    return {
      message: 'File renamed successfully',
      newUrl: result.secure_url,
      result,
    };
  }
}
