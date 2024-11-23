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
} from '@nestjs/common';
import { CvService } from './cv.service';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { ApiTags } from '@nestjs/swagger';
import { Public, ResponseMessage } from 'src/decorator/customize';
import { DeleteCvDto } from './dto/delete-cv.dto';

@Controller('cvs')
@ApiTags('CV')
@Public()
export class CvController {
  constructor(private readonly cvService: CvService) {}

  @Post()
  create(@Body() createCvDto: CreateCvDto) {
    return this.cvService.create(createCvDto);
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
  findAll(
    @Query() query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.cvService.findAll(query, +current, +pageSize);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cvService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCvDto: UpdateCvDto) {
    return this.cvService.update(id, updateCvDto);
  }

  @Delete()
  remove(@Body() data: DeleteCvDto) {
    return this.cvService.remove(data);
  }

  @Get('user/:id')
  findCvByUserId(
    @Param('id') id: string,
    @Query() query,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.cvService.findCvByUserId(id, query, +current, +pageSize);
  }
}
