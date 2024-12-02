import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { MajorService } from './major.service';
import { CreateMajorDto, DeleteMarjorDto } from './dto/create-major.dto';
import { UpdateMajorDto } from './dto/update-major.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
@Controller('majors')
@ApiTags('majors')
export class MajorController {
  constructor(private readonly majorService: MajorService) {}

  @Post()
  async create(@Body() createMajorDto: CreateMajorDto) {
    return await this.majorService.create(createMajorDto);
  }
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of users.' })
  @Get()
  async findAll(
    @Query() query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return await this.majorService.findAll(query, +current, +pageSize);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.majorService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateMajorDto: UpdateMajorDto,
  ) {
    return await this.majorService.update(+id, updateMajorDto);
  }

  @Delete()
  async remove(@Body() deleteDto: DeleteMarjorDto) {
    return await this.majorService.remove(deleteDto);
  }
}
