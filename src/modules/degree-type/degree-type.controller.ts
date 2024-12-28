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
import { ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from 'src/decorator/customize';
import { DegreeTypeService } from './degree-type.service';
import { CreateDegreeTypeDto } from './dto/create-degree-type.dto';
import { UpdateDegreeTypeDto } from './dto/update-degree-type.dto';
import { DegreeType } from './schema/degree-type.schema';
import { Meta } from '../types';
@Controller('degree-types')
@ApiTags('JobTypes')
export class DegreeTypeController {
  constructor(private readonly degreeTypeService: DegreeTypeService) {}

  @Post()
  @ResponseMessage('Success')
  async create(
    @Body() createJobType: CreateDegreeTypeDto,
  ): Promise<DegreeType> {
    return await this.degreeTypeService.create(createJobType);
  }

  @Get()
  @ResponseMessage('Success')
  async findAll(
    @Query('query') query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ): Promise<{ items: DegreeType[]; meta: Meta }> {
    return await this.degreeTypeService.findAll(query, +current, +pageSize);
  }

  @Get(':id')
  @ResponseMessage('Success')
  async findOne(@Param('id') id: string): Promise<DegreeType> {
    return await this.degreeTypeService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Success')
  async update(
    @Param('id') id: string,
    @Body() updateLevelDto: UpdateDegreeTypeDto,
  ): Promise<DegreeType> {
    return await this.degreeTypeService.update(id, updateLevelDto);
  }

  @Delete()
  @ResponseMessage('Success')
  async remove(@Body('ids') ids: Array<string>): Promise<[]> {
    return await this.degreeTypeService.remove(ids);
  }
}
