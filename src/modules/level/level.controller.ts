import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { LevelService } from './level.service';
import { CreateLevelDto } from './dto/create-level.dto';
import { UpdateLevelDto } from './dto/update-level.dto';
import { ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from 'src/decorator/customize';
import { Public } from 'src/decorator/customize';
@Controller('levels')
@ApiTags('Levels')
@Public()
export class LevelController {
  constructor(private readonly levelService: LevelService) {}

  @Post()
  @ResponseMessage('Success')
  create(@Body() createLevelDto: CreateLevelDto) {
    return this.levelService.create(createLevelDto);
  }

  @Get()
  @ResponseMessage('Success')
  findAll(
    @Query('query') query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.levelService.findAll(query,+current,+pageSize);
  }

  @Get(':id')
  @ResponseMessage('Success')
  findOne(@Param('id') id: string) {
    return this.levelService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Success')
  update(@Param('id') id: string, @Body() updateLevelDto: UpdateLevelDto) {
    return this.levelService.update(id, updateLevelDto);
  }

  @Delete()
  @ResponseMessage('Success')
  remove(@Body('ids') ids: Array<string>) {
    return this.levelService.remove(ids);
  }
}
