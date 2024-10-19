import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CvUploadService } from './cv-upload.service';
import { ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Public, ResponseMessage } from 'src/decorator/customize';
@Controller('upload-cvs')
@ApiTags('UploadCv')
@Public()
export class CvUploadController {
  constructor(private readonly cvUploadService: CvUploadService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        name: {
          type: 'string',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  @ResponseMessage('Success')
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body('user_id') userId: string,
  ) {
    return this.cvUploadService.create(file, userId);
  }

  @Get(':id')
  @ResponseMessage('Success')
  async findOne(@Param('id') id: string) {
    return this.cvUploadService.findOne(id);
  }
  @Get('user/:id')
  @ResponseMessage('Success')
  async findByUserId(@Param('id') id: string) {
    return this.cvUploadService.findByUserId(id);
  }

  @Get('')
  @ResponseMessage('Success')
  async findAll(
    @Query('query') query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.cvUploadService.findAll(query, +current, +pageSize);
  }

  @Delete('user/:id')
  @ResponseMessage('Success')
  async removeByUserId(
    @Param('id') cvId: string,
    @Body('userId') userId: string,
  ) {
    return this.cvUploadService.removeByUserId(cvId, userId);
  }

  @Delete('')
  @ResponseMessage('Success')
  async removeMany(@Body('ids') ids: Array<string>) {
    return this.cvUploadService.removeMany(ids);
  }
}
