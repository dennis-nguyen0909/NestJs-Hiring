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
import { JobContractTypeService } from './job-contract-type.service';
import { CreateJobContractTypeDto } from './dto/create-job-contract-type.dto';
import { UpdateJobContractTypeDto } from './dto/update-job-contract-type.dto';
import { JobContractType } from './schema/job-contract-type.schema';
import { Meta } from '../types';
@Controller('job-contracts')
@ApiTags('JobTypes')
export class JobContractTypeController {
  constructor(
    private readonly jobContractTypeService: JobContractTypeService,
  ) {}

  @Post()
  @ResponseMessage('Success')
  async create(
    @Body() createJobType: CreateJobContractTypeDto,
  ): Promise<JobContractType> {
    return await this.jobContractTypeService.create(createJobType);
  }

  @Get()
  @ResponseMessage('Success')
  async findAll(
    @Query('query') query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ): Promise<{ items: JobContractType[]; meta: Meta }> {
    return await this.jobContractTypeService.findAll(
      query,
      +current,
      +pageSize,
    );
  }

  @Get(':id')
  @ResponseMessage('Success')
  async findOne(@Param('id') id: string): Promise<JobContractType> {
    return await this.jobContractTypeService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Success')
  async update(
    @Param('id') id: string,
    @Body() updateLevelDto: UpdateJobContractTypeDto,
  ): Promise<JobContractType> {
    return await this.jobContractTypeService.update(id, updateLevelDto);
  }

  @Delete()
  @ResponseMessage('Success')
  async remove(@Body('ids') ids: Array<string>): Promise<[]> {
    return await this.jobContractTypeService.remove(ids);
  }
}
