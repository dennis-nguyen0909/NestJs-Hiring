import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CvUploadService } from './cv-upload.service';
import { CreateCvUploadDto } from './dto/create-cv-upload.dto';
import { UpdateCvUploadDto } from './dto/update-cv-upload.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('cv-upload')
@ApiTags('CvUpload')
export class CvUploadController {
  constructor(private readonly cvUploadService: CvUploadService) {}

  @Post()
  create(@Body() createCvUploadDto: CreateCvUploadDto) {
    return this.cvUploadService.create(createCvUploadDto);
  }

  @Get()
  findAll() {
    return this.cvUploadService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cvUploadService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCvUploadDto: UpdateCvUploadDto) {
    return this.cvUploadService.update(+id, updateCvUploadDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cvUploadService.remove(+id);
  }
}
