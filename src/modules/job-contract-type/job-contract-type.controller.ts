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
@Controller('job-contracts')
@ApiTags('JobTypes')
export class JobContractTypeController {
  constructor(
    private readonly jobContractTypeService: JobContractTypeService,
  ) {}

  @Post()
  @ResponseMessage('Success')
  create(@Body() createJobType: CreateJobContractTypeDto) {
    return this.jobContractTypeService.create(createJobType);
  }

  @Get()
  @ResponseMessage('Success')
  findAll(
    @Query('query') query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.jobContractTypeService.findAll(query, +current, +pageSize);
  }

  @Get(':id')
  @ResponseMessage('Success')
  findOne(@Param('id') id: string) {
    return this.jobContractTypeService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Success')
  update(
    @Param('id') id: string,
    @Body() updateLevelDto: UpdateJobContractTypeDto,
  ) {
    return this.jobContractTypeService.update(id, updateLevelDto);
  }

  @Delete()
  @ResponseMessage('Success')
  remove(@Body('ids') ids: Array<string>) {
    return this.jobContractTypeService.remove(ids);
  }
}
