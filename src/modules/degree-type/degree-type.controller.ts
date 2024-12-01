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
@Controller('degree-types')
@ApiTags('JobTypes')
export class DegreeTypeController {
  constructor(private readonly degreeTypeService: DegreeTypeService) {}

  @Post()
  @ResponseMessage('Success')
  create(@Body() createJobType: CreateDegreeTypeDto) {
    return this.degreeTypeService.create(createJobType);
  }

  @Get()
  @ResponseMessage('Success')
  findAll(
    @Query('query') query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.degreeTypeService.findAll(query, +current, +pageSize);
  }

  @Get(':id')
  @ResponseMessage('Success')
  findOne(@Param('id') id: string) {
    return this.degreeTypeService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Success')
  update(@Param('id') id: string, @Body() updateLevelDto: UpdateDegreeTypeDto) {
    return this.degreeTypeService.update(id, updateLevelDto);
  }

  @Delete()
  @ResponseMessage('Success')
  remove(@Body('ids') ids: Array<string>) {
    return this.degreeTypeService.remove(ids);
  }
}
