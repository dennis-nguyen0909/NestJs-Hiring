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
import { Public, ResponseMessage } from 'src/decorator/customize';
import { OrganizationTypeService } from './organization_type.service';
import { CreateOrganizationTypeDto } from './dto/create-organization_type.dto';
import { UpdateOrganizationTypeDto } from './dto/update-organization_type.dto';
@Controller('organization-types')
@ApiTags('OrganizationTypes')
export class OrganizationTypeController {
  constructor(
    private readonly organizationTypeService: OrganizationTypeService,
  ) {}

  @Post()
  @ResponseMessage('Success')
  async create(@Body() createJobType: CreateOrganizationTypeDto) {
    return await this.organizationTypeService.create(createJobType);
  }

  @Get()
  @ResponseMessage('Success')
  async findAll(
    @Query('query') query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return await this.organizationTypeService.findAll(
      query,
      +current,
      +pageSize,
    );
  }

  @Get(':id')
  @ResponseMessage('Success')
  async findOne(@Param('id') id: string) {
    return await this.organizationTypeService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Success')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateOrganizationTypeDto,
  ) {
    return await this.organizationTypeService.update(id, updateDto);
  }

  @Delete()
  @ResponseMessage('Success')
  async remove(@Body('ids') ids: Array<string>) {
    return await this.organizationTypeService.remove(ids);
  }
}
