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
import { Public } from 'src/decorator/customize';
import { JobTypeService } from './job-type.service';
import { CreateJobTypeDto } from './dto/create-job-type.dto';
import { UpdateJobTypeDto } from './dto/update-job-type.dto';
@Controller('job-types')
@ApiTags('JobTypes')
export class JobTypeController {
  constructor(private readonly jobTypeService: JobTypeService) {}

  @Post()
  @ResponseMessage('Success')
  create(@Body() createJobType: CreateJobTypeDto) {
    return this.jobTypeService.create(createJobType);
  }

  @Get()
  @ResponseMessage('Success')
  findAll(
    @Query('query') query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.jobTypeService.findAll(query, +current, +pageSize);
  }

  @Get(':id')
  @ResponseMessage('Success')
  findOne(@Param('id') id: string) {
    return this.jobTypeService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Success')
  update(@Param('id') id: string, @Body() updateLevelDto: UpdateJobTypeDto) {
    return this.jobTypeService.update(id, updateLevelDto);
  }

  @Delete()
  @ResponseMessage('Success')
  remove(@Body('ids') ids: Array<string>) {
    return this.jobTypeService.remove(ids);
  }
}
