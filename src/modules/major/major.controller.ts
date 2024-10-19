import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { MajorService } from './major.service';
import { CreateMajorDto, DeleteMarjorDto } from './dto/create-major.dto';
import { UpdateMajorDto } from './dto/update-major.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/decorator/customize';
@Controller('majors')
@ApiTags('majors')
@Public()
export class MajorController {
  constructor(private readonly majorService: MajorService) {}

  @Post()
  create(@Body() createMajorDto: CreateMajorDto) {
    return this.majorService.create(createMajorDto);
  }
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of users.' })
  @Get()
  findAll(
    @Query() query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.majorService.findAll(query,+current,+pageSize);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.majorService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMajorDto: UpdateMajorDto) {
    return this.majorService.update(+id, updateMajorDto);
  }

  @Delete()
  remove(@Body() deleteDto: DeleteMarjorDto) {
    return this.majorService.remove(deleteDto);
  }
}
