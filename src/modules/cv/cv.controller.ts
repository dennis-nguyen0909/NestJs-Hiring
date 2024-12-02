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
  Req,
} from '@nestjs/common';
import { CvService } from './cv.service';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from 'src/decorator/customize';
import { DeleteCvDto } from './dto/delete-cv.dto';

@Controller('cvs')
@ApiTags('CV')
export class CvController {
  constructor(private readonly cvService: CvService) {}

  @Post()
  @ResponseMessage('success')
  async create(@Body() createCvDto: CreateCvDto) {
    return await this.cvService.create(createCvDto);
  }

  @Get('download/:userId')
  @ResponseMessage('Download CV')
  async downloadPDF(
    @Param('userId') userId: string,
    @Res() res,
  ): Promise<void> {
    // Gọi phương thức từ service để lấy đường dẫn file CV
    const buffer = await await this.cvService.generalPDF(userId);
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
  ) {
    return await this.cvService.findAll(query, +current, +pageSize);
  }

  @Get(':id')
  @ResponseMessage('success')
  async findOne(@Param('id') id: string) {
    return await this.cvService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('success')
  async update(@Param('id') id: string, @Body() updateCvDto: UpdateCvDto) {
    return await this.cvService.update(id, updateCvDto);
  }

  @Delete()
  @ResponseMessage('success')
  async remove(@Body() data: DeleteCvDto, @Req() req) {
    const userId = req.user._id;
    return await this.cvService.remove(data, userId);
  }
  @Delete(':id')
  @ResponseMessage('success')
  async delete(@Param('id') id: string, @Req() req) {
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
  ) {
    return await this.cvService.findCvByUserId(id, query, +current, +pageSize);
  }
}
