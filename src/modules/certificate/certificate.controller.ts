// certificate.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  Req,
} from '@nestjs/common';
import { CertificateService } from './certificate.service';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { UpdateCertificateDto } from './dto/update-certificate.dto';
import { ResponseMessage } from 'src/decorator/customize';
@Controller('certificates')
export class CertificateController {
  constructor(private readonly certificateService: CertificateService) {}

  @Post()
  @ResponseMessage('Success')
  create(@Body() createCertificateDto: CreateCertificateDto) {
    return this.certificateService.create(createCertificateDto);
  }

  @Get()
  @ResponseMessage('Success')
  findAll(
    @Query('current') current: string,
    @Query('query') query: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.certificateService.findAll(query, +current, +pageSize);
  }

  @Get(':id')
  @ResponseMessage('Success')
  findOne(@Param('id') id: string) {
    return this.certificateService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Success')
  update(
    @Param('id') id: string,
    @Body() updateCertificateDto: UpdateCertificateDto,
  ) {
    return this.certificateService.update(id, updateCertificateDto);
  }

  @Delete(':id')
  @ResponseMessage('Success')
  remove(@Param('id') id: string, @Req() req:any) {
    const userId = req.user._id;
    return this.certificateService.remove(id, userId);
  }
}
