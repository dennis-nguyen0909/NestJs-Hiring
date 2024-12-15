import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Put,
} from '@nestjs/common';
import { ApplicationService } from './application.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { ApiBody, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Public, ResponseMessage } from 'src/decorator/customize';
import { DeleteApplicationDto } from './dto/delete-application.dto';

@Controller('applications')
@ApiTags('Application')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Post()
  @ResponseMessage('Success')
  @ApiBody({ type: CreateApplicationDto })
  async create(@Body() createApplicationDto: CreateApplicationDto) {
    return await this.applicationService.create(createApplicationDto);
  }

  @Get('recently-applied-candidate')
  async getRecentlyAppliedCandidate(
    @Query('query') query: string,
    @Query('current') current: number,
    @Query('pageSize') pageSize: number,
  ) {
    return await this.applicationService.getRecentlyAppliedCandidate(
      query,
      current,
      pageSize,
    );
  }

  @Delete(':id/cancel')
  @ResponseMessage('Success')
  async cancelApplication(
    @Param('id') applicationId: string,
    @Body('user_id') userId: string,
  ) {
    return await this.applicationService.cancelApplication(
      applicationId,
      userId,
    );
  }

  @Get('/job_id/:id')
  @ResponseMessage('Success')
  async getApplicationByJobId(
    @Param('id') id: string,
    @Query('query') query,
    @Query('current') current,
    @Query('pageSize') pageSize,
  ) {
    return await this.applicationService.getApplicationByJobId(
      id,
      query,
      +current,
      +pageSize,
    );
  }

  @Get()
  @ResponseMessage('Success')
  @ApiQuery({
    name: 'current',
    required: false,
    description: 'Current page number',
    example: 1,
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    description: 'Number of items per page',
    example: 10,
  })
  @ApiQuery({
    name: 'query',
    required: false,
    description:
      'Search filters for applications [pending , accepted, rejected]',
    type: 'object',
    example: { status: 'pending' },
  })
  async findAll(
    @Query('query') query,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return await this.applicationService.findAll(query, +current, +pageSize);
  }

  @Get(':id')
  @ResponseMessage('Success')
  async findOne(@Param('id') id: string) {
    return await this.applicationService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Success')
  @ApiBody({ type: UpdateApplicationDto })
  async update(
    @Param('id') id: string,
    @Body() updateApplicationDto: UpdateApplicationDto,
  ) {
    return await this.applicationService.update(id, updateApplicationDto);
  }

  @Delete()
  @ResponseMessage('Success')
  @ApiQuery({
    name: 'query',
    required: false,
    description: 'Delete 1 or multiple applications by ids [id1,id2]',
    type: 'object',
    example: { ids: ['id1', 'id2'] },
  })
  async remove(@Body() data: DeleteApplicationDto) {
    return await this.applicationService.remove(data);
  }

  @ResponseMessage('Success')
  @Put(':applicationId/toggle-save/:userId')
  async toggleSaveCandidate(
    @Param('applicationId') applicationId: string,
    @Param('userId') userId: string,
  ) {
    return this.applicationService.toggleSaveCandidate(applicationId, userId);
  }

  @ResponseMessage('Success')
  @Get('applied/:userId')
  async getAppliedUserId(@Param('userId') userId: string) {
    return await this.applicationService.getAppliedUserId(userId);
  }

  @Get('recently-applied/:candidate_id')
  @ApiParam({
    name: 'candidate_id',
    type: String,
    description: 'ID of the candidate',
  })
  async getRecentlyApplied(
    @Param('candidate_id') candidate_id: string,
    @Query('limit') limit: string,
  ) {
    return await this.applicationService.getRecentlyApplied(
      candidate_id,
      +limit,
    );
  }
}
