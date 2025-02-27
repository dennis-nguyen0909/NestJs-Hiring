import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Res,
  Req
} from '@nestjs/common';
import { CvService } from './cv.service';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from 'src/decorator/customize';
import { DeleteCvDto } from './dto/delete-cv.dto';
import { CV } from './schema/CV.schema';
import { Meta } from '../types';
import { Request } from 'express';

@Controller('cvs')
@ApiTags('CV')
export class CvController {
  constructor(private readonly cvService: CvService) {}

  @Post()
  @ResponseMessage('success')
  async create(
    @Body() createCvDto: CreateCvDto,
    @Req() req: Request,
  ): Promise<CV> {
    return await this.cvService.create(createCvDto, req);
  }

  @Get('download/:userId')
  @ResponseMessage('Download CV')
  async downloadPDF(
    @Param('userId') userId: string,
    @Res() res,
  ): Promise<void> {
    // Gọi phương thức từ service để lấy đường dẫn file CV
    const buffer = await this.cvService.generalPDF(userId);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=CV.pdf',
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @Get()
  @ResponseMessage('success')
  async findAll(
    @Query('query') query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ): Promise<{ items: CV[]; meta: Meta }> {
    return await this.cvService.findAll(query, +current, +pageSize);
  }

  @Get(':id')
  @ResponseMessage('success')
  async findOne(@Param('id') id: string): Promise<CV> {
    return await this.cvService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('success')
  async update(
    @Param('id') id: string,
    @Body() updateCvDto: UpdateCvDto,
  ): Promise<{ message: string; data: CV }> {
    return await this.cvService.update(id, updateCvDto);
  }

  @Delete()
  @ResponseMessage('success')
  async remove(
    @Body() data: DeleteCvDto,
    @Req() req,
  ): Promise<{ message: string; data: any[] }> {
    const userId = req.user._id;
    return await this.cvService.remove(data, userId, req);
  }
  @Delete(':id')
  @ResponseMessage('success')
  async delete(@Param('id') id: string, @Req() req): Promise<void> {
    const userId = req.user._id;
    return await this.cvService.delete(id, userId);
  }

  @Get('user/:id')
  @ResponseMessage('success')
  async findCvByUserId(
    @Param('id') id: string,
    @Query('query') query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ): Promise<{ data: { items: CV[]; meta: Meta } }> {
    return await this.cvService.findCvByUserId(id, query, +current, +pageSize);
  }
}
