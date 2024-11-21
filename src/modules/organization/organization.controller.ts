import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import {  ResponseMessage } from 'src/decorator/customize';

@Controller('organizations')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post()
  create(
    @Body() createOrganizationDto: CreateOrganizationDto,
    @Param('user_id') userId: string,
  ) {
    return this.organizationService.create(createOrganizationDto, userId);
  }

  @Get()
  findAll() {
    return this.organizationService.findAll();
  }

  @Get('owner/:id')
  @ResponseMessage('success')
  async finByOwner(@Param('owner_id') id: string) {
    return await this.organizationService.findByOwner(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.organizationService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
  ) {
    return this.organizationService.update(id, updateOrganizationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.organizationService.remove(id);
  }
}
