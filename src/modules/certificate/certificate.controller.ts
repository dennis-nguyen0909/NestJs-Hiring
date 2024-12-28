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
import { Certificate } from './schema/certificate.schema';
import { Meta } from '../types';
@Controller('certificates')
export class CertificateController {
  constructor(private readonly certificateService: CertificateService) {}

  @Post()
  @ResponseMessage('Success')
  async create(
    @Body() createCertificateDto: CreateCertificateDto,
  ): Promise<Certificate> {
    return await this.certificateService.create(createCertificateDto);
  }

  @Get()
  @ResponseMessage('Success')
  async findAll(
    @Query('current') current: string,
    @Query('query') query: string,
    @Query('pageSize') pageSize: string,
  ): Promise<{ items: Certificate[]; meta: Meta }> {
    return await this.certificateService.findAll(query, +current, +pageSize);
  }

  @Get(':id')
  @ResponseMessage('Success')
  async findOne(@Param('id') id: string): Promise<Certificate> {
    return await this.certificateService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Success')
  async update(
    @Param('id') id: string,
    @Body() updateCertificateDto: UpdateCertificateDto,
  ): Promise<Certificate> {
    return await this.certificateService.update(id, updateCertificateDto);
  }

  @Delete(':id')
  @ResponseMessage('Success')
  async remove(@Param('id') id: string, @Req() req: any): Promise<void> {
    const userId = req.user._id;
    return await this.certificateService.remove(id, userId);
  }
}
