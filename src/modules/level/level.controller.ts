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
import { LevelService } from './level.service';
import { CreateLevelDto } from './dto/create-level.dto';
import { UpdateLevelDto } from './dto/update-level.dto';
import { ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from 'src/decorator/customize';
import { Level } from './schema/Level.schema';
import { Meta } from '../types';
@Controller('levels')
@ApiTags('Levels')
export class LevelController {
  constructor(private readonly levelService: LevelService) {}

  @Post()
  @ResponseMessage('Success')
  async create(@Body() createLevelDto: CreateLevelDto): Promise<Level> {
    return await this.levelService.create(createLevelDto);
  }

  @Get()
  @ResponseMessage('Success')
  async findAll(
    @Query('query') query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ): Promise<{ items: Level[]; meta: Meta }> {
    return await this.levelService.findAll(query, +current, +pageSize);
  }

  @Get(':id')
  @ResponseMessage('Success')
  async findOne(@Param('id') id: string): Promise<Level> {
    return await this.levelService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Success')
  async update(
    @Param('id') id: string,
    @Body() updateLevelDto: UpdateLevelDto,
  ): Promise<Level> {
    return await this.levelService.update(id, updateLevelDto);
  }

  @Delete()
  @ResponseMessage('Success')
  async remove(@Body('ids') ids: Array<string>): Promise<[]> {
    return await this.levelService.remove(ids);
  }
}
