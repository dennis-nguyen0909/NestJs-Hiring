import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CompanyStatusService } from './company-status.service';
import { CreateCompanyStatusDto } from './dto/create-company-status.dto';
import { UpdateCompanyStatusDto } from './dto/update-company-status.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public, ResponseMessage } from 'src/decorator/customize';
import { CompanyApplicationStatus } from './schema/CompanyApplicationStatus.schema';

@Controller('company-statuses')
@ApiTags('Company Application Statuses')
@Public()
export class CompanyStatusController {
  constructor(private readonly companyStatusService: CompanyStatusService) {}

  @Post(':companyId')
  @ResponseMessage('Create company status successfully')
  @ApiOperation({ summary: 'Create a new application status for a company' })
  async create(
    @Param('companyId') companyId: string,
    @Body() createDto: CreateCompanyStatusDto,
  ): Promise<CompanyApplicationStatus> {
    return await this.companyStatusService.create(companyId, createDto);
  }

  @Get(':companyId')
  @ResponseMessage('Get company statuses successfully')
  @ApiOperation({ summary: 'Get all application statuses for a company' })
  async findAll(
    @Param('companyId') companyId: string,
  ): Promise<CompanyApplicationStatus[]> {
    return await this.companyStatusService.findAll(companyId);
  }

  @Get(':companyId/:id')
  @ResponseMessage('Get company status successfully')
  @ApiOperation({ summary: 'Get a specific application status' })
  async findOne(@Param('id') id: string): Promise<CompanyApplicationStatus> {
    return await this.companyStatusService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Update company status successfully')
  @ApiOperation({ summary: 'Update an application status' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateCompanyStatusDto,
  ): Promise<CompanyApplicationStatus> {
    return await this.companyStatusService.update(id, updateDto);
  }

  @Delete(':id')
  @ResponseMessage('Delete company status successfully')
  @ApiOperation({ summary: 'Delete an application status' })
  async remove(@Param('id') id: string): Promise<CompanyApplicationStatus> {
    return await this.companyStatusService.remove(id);
  }
}
