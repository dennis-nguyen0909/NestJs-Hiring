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
import { JobService } from './job.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { ApiTags } from '@nestjs/swagger';
import { Public, ResponseMessage } from 'src/decorator/customize';
import { DeleteJobDto, ToggleLikeDTO } from './dto/delete-job.dto';

@Controller('jobs')
@ApiTags('Job')
@Public()
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Post()
  @ResponseMessage('Success')
  create(@Body() createJobDto: CreateJobDto) {
    return this.jobService.create(createJobDto);
  }

  @Get('getJobSearchName')
  @ResponseMessage('Success')
  findJobsByCompanyName(
    @Query('query') query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.jobService.findJobsByCompanyName(query, +current, +pageSize);
  }
  @Get('district/:id')
  getJobByDistrict(@Param('id') id: string) {
    return 'ok';
  }

  @Get('employer')
  @ResponseMessage('Success')
  getJobByEmployer(
    @Query('user_id') user_id: string,
    @Query('query') query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.jobService.getJobByEmployer(
      user_id,
      query,
      +current,
      +pageSize,
    );
  }

  @Get('recent')
  @ResponseMessage('Success')
  findRecentJobs(
    @Query('query') query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.jobService.findRecentJobs(query, +current, +pageSize);
  }

  @Get('active/:userId')
  @ResponseMessage('Success')
  countActiveJobsByUser(@Param('userId') userId: string) {
    return this.jobService.countActiveJobsByUser(userId);
  }

  @Get()
  @ResponseMessage('Success')
  findAll(
    @Query('query') query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.jobService.findAll(query, +current, +pageSize);
  }

  @Get(':id')
  @ResponseMessage('Success')
  findOne(@Param('id') id: string) {
    return this.jobService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Success')
  update(@Param('id') id: string, @Body() updateJobDto: UpdateJobDto) {
    return this.jobService.update(id, updateJobDto);
  }

  @Delete()
  @ResponseMessage('Success')
  remove(@Body() data: DeleteJobDto) {
    return this.jobService.remove(data);
  }

  @Post('toggle-like')
  @ResponseMessage('Success')
  toggleLikeJob(@Body() data: ToggleLikeDTO) {
    return this.jobService.toggleLikeJob(data.user_id, data.job_id);
  }
}
