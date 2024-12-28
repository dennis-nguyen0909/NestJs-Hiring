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
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { ResponseMessage } from 'src/decorator/customize';
import { Organization } from './schema/organization.schema';
import { Meta } from '../types';

@Controller('organizations')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post()
  @ResponseMessage('success')
  async create(
    @Body() createOrganizationDto: CreateOrganizationDto,
    @Param('user_id') userId: string,
  ): Promise<Organization> {
    return await this.organizationService.create(createOrganizationDto, userId);
  }

  @Get()
  @ResponseMessage('success')
  async findAll(
    @Query('query') query,
    @Query('current') current,
    @Query('pageSize') pageSize,
  ): Promise<{ items: Organization[]; meta: Meta }> {
    return await this.organizationService.findAll(query, +current, +pageSize);
  }

  @Get('owner/:id')
  @ResponseMessage('success')
  async finByOwner(@Param('owner_id') id: string): Promise<Organization[]> {
    return await this.organizationService.findByOwner(id);
  }

  @Get(':id')
  @ResponseMessage('success')
  async findOne(@Param('id') id: string): Promise<Organization> {
    return await this.organizationService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('success')
  async update(
    @Param('id') id: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
  ): Promise<Organization> {
    return await this.organizationService.update(id, updateOrganizationDto);
  }

  @Delete(':id')
  @ResponseMessage('success')
  async remove(@Param('id') id: string): Promise<Organization> {
    return await this.organizationService.remove(id);
  }
}
