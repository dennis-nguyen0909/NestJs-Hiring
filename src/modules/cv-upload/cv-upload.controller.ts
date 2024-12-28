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
import { ResponseMessage } from 'src/decorator/customize';
import { CVUploads } from './schema/CvUploads.schema';
import { Meta } from '../types';
@Controller('upload-cvs')
@ApiTags('UploadCv')
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
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body('user_id') userId: string,
  ): Promise<CVUploads> {
    return await this.cvUploadService.create(file, userId);
  }

  @Get(':id')
  @ResponseMessage('Success')
  async findOne(@Param('id') id: string): Promise<CVUploads> {
    return await this.cvUploadService.findOne(id);
  }
  @Get('user/:id')
  @ResponseMessage('Success')
  async findByUserId(@Param('id') id: string): Promise<any> {
    return await this.cvUploadService.findByUserId(id);
  }

  @Get('')
  @ResponseMessage('Success')
  async findAll(
    @Query('query') query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ): Promise<{ items: CVUploads[]; meta: Meta }>  {
    return await this.cvUploadService.findAll(query, +current, +pageSize);
  }

  @Delete('user/:id')
  @ResponseMessage('Success')
  async removeByUserId(
    @Param('id') cvId: string,
    @Body('userId') userId: string,
  ): Promise<[]> {
    return await this.cvUploadService.removeByUserId(cvId, userId);
  }

  @Delete('')
  @ResponseMessage('Success')
  async removeMany(@Body('ids') ids: Array<string>): Promise<[]> {
    return await this.cvUploadService.removeMany(ids);
  }
}
