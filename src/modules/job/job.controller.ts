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
import { Job } from './schema/Job.schema';
import { Meta } from '../types';

@Controller('jobs')
@ApiTags('Job')
@Public()
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Post()
  @ResponseMessage('Success')
  async create(@Body() createJobDto: CreateJobDto): Promise<Job> {
    return await this.jobService.create(createJobDto);
  }
  @Get('test')
  async testSearch(
    @Query('query') query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ): Promise<Job[] | []> {
    return this.jobService.testSearch(query, +current, +pageSize);
  }

  @Get('getJobSearchName')
  @ResponseMessage('Success')
  async findJobsByCompanyName(
    @Query('query') query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ): Promise<{ items: Job[]; meta: Meta }> {
    return await this.jobService.findJobsByCompanyName(
      query,
      +current,
      +pageSize,
    );
  }
  @Get('district/:id')
  async getJobByDistrict(@Param('id') id: string): Promise<string> {
    return 'ok';
  }

  @Get('employer')
  @ResponseMessage('Success')
  async getJobByEmployer(
    @Query('user_id') user_id: string,
    @Query('query') query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ): Promise<{ items: Job[]; meta: Meta }> {
    return await this.jobService.getJobByEmployer(
      user_id,
      query,
      +current,
      +pageSize,
    );
  }

  @Get('recent')
  @ResponseMessage('Success')
  async findRecentJobs(
    @Query('query') query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ): Promise<{ items: Job[]; meta: Meta }> {
    return await this.jobService.findRecentJobs(query, +current, +pageSize);
  }

  @Get('active/:userId')
  @ResponseMessage('Success')
  async countActiveJobsByUser(
    @Param('userId') userId: string,
  ): Promise<number> {
    return await this.jobService.countActiveJobsByUser(userId);
  }

  @Get()
  @ResponseMessage('Success')
  async findAll(
    @Query('query') query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ): Promise<{ items: Job[]; meta: Meta }> {
    return await this.jobService.findAll(query, +current, +pageSize);
  }

  @Get(':id')
  @ResponseMessage('Success')
  async findOne(@Param('id') id: string): Promise<Job> {
    return await this.jobService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Success')
  async update(
    @Param('id') id: string,
    @Body() updateJobDto: UpdateJobDto,
  ): Promise<Job> {
    return await this.jobService.update(id, updateJobDto);
  }

  @Delete()
  @ResponseMessage('Success')
  async remove(@Body() data: DeleteJobDto): Promise<[]> {
    return await this.jobService.remove(data);
  }

  @Post('toggle-like')
  @ResponseMessage('Success')
  async toggleLikeJob(@Body() data: ToggleLikeDTO): Promise<void> {
    return await this.jobService.toggleLikeJob(data.user_id, data.job_id);
  }
}
