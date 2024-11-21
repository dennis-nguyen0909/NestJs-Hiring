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
import { ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Public, ResponseMessage } from 'src/decorator/customize';
import { DeleteApplicationDto } from './dto/delete-application.dto';

@Controller('applications')
@ApiTags('Application')
@Public()
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Post()
  @ResponseMessage('Success')
  @ApiBody({ type: CreateApplicationDto })
  create(@Body() createApplicationDto: CreateApplicationDto) {
    return this.applicationService.create(createApplicationDto);
  }

  @Delete(':id/cancel')
  @ResponseMessage('Success')
  async cancelApplication(
    @Param('id') applicationId: string,
    @Body('user_id') userId: string,
  ) {
    return this.applicationService.cancelApplication(applicationId, userId);
  }

  @Get('/job_id/:id')
  @ResponseMessage('Success')
  getApplicationByJobId(
    @Param('id') id: string,
    @Query('query') query,
    @Query('current') current,
    @Query('pageSize') pageSize,
  ) {
    return this.applicationService.getApplicationByJobId(
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
  findAll(
    @Query() query,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.applicationService.findAll(query, +current, +pageSize);
  }

  @Get(':id')
  @ResponseMessage('Success')
  findOne(@Param('id') id: string) {
    return this.applicationService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Success')
  @ApiBody({ type: UpdateApplicationDto })
  update(
    @Param('id') id: string,
    @Body() updateApplicationDto: UpdateApplicationDto,
  ) {
    return this.applicationService.update(id, updateApplicationDto);
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
  remove(@Body() data: DeleteApplicationDto) {
    return this.applicationService.remove(data);
  }

  @ResponseMessage('Success')
  @Put(':applicationId/toggle-save/:userId')
  async toggleSaveCandidate(
    @Param('applicationId') applicationId: string,
    @Param('userId') userId: string,
  ) {
    return this.applicationService.toggleSaveCandidate(applicationId, userId);
  }
}
