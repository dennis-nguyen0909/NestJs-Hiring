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
import { IndustryTypeService } from './industry_type.service';
import { CreateOrganizationTypeDto } from '../organization_type/dto/create-organization_type.dto';
import { UpdateIndustryTypeDto } from './dto/update-industry_type.dto';
import { IndustryType } from './schema/industry_type.schema';
import { Meta } from '../types';
@Controller('industry-types')
@ApiTags('IndustryTypes')
export class IndustryTypeController {
  constructor(private readonly industryTypeService: IndustryTypeService) {}

  @Post()
  @ResponseMessage('Success')
  async create(
    @Body() createJobType: CreateOrganizationTypeDto,
  ): Promise<IndustryType> {
    return await this.industryTypeService.create(createJobType);
  }

  @Get()
  @ResponseMessage('Success')
  async findAll(
    @Query('query') query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ): Promise<{ items: IndustryType[]; meta: Meta }> {
    return await this.industryTypeService.findAll(query, +current, +pageSize);
  }

  @Get(':id')
  @ResponseMessage('Success')
  async findOne(@Param('id') id: string): Promise<IndustryType> {
    return await this.industryTypeService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Success')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateIndustryTypeDto,
  ): Promise<IndustryType> {
    return await this.industryTypeService.update(id, updateDto);
  }

  @Delete()
  @ResponseMessage('Success')
  async remove(@Body('ids') ids: Array<string>): Promise<[]> {
    return await this.industryTypeService.remove(ids);
  }
}
