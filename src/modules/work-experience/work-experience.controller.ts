import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Request,
} from '@nestjs/common';
import { WorkExperienceService } from './work-experience.service';
import { CreateWorkExperienceDto } from './dto/create-work-experience.dto';
import { UpdateWorkExperienceDto } from './dto/update-work-experience.dto';
import { ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from 'src/decorator/customize';
import { WorkExperience } from './schema/WorkExperience.schema';

@Controller('work-experiences')
@ApiTags('WorkExperience')
export class WorkExperienceController {
  constructor(private readonly workExperienceService: WorkExperienceService) {}

  @Post()
  @ResponseMessage('Success')
  create(@Body() createWorkExperienceDto: CreateWorkExperienceDto) {
    return this.workExperienceService.create(createWorkExperienceDto);
  }

  @Get()
  @ResponseMessage('Success')
  findAll(
    @Query('query') query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.workExperienceService.findAll(query, +current, +pageSize);
  }

  @Get('user')
  @ResponseMessage('Success')
  async getWorkExperienceByUserId(@Request() req): Promise<WorkExperience[]> {
    return this.workExperienceService.getWorkExperienceByUserId(req.user._id);
  }
  @Get(':id')
  @ResponseMessage('Success')
  findOne(@Param('id') id: string) {
    return this.workExperienceService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Success')
  update(
    @Param('id') id: string,
    @Body() updateWorkExperienceDto: UpdateWorkExperienceDto,
  ) {
    return this.workExperienceService.update(id, updateWorkExperienceDto);
  }

  @Delete()
  @ResponseMessage('Success')
  remove(@Body('ids') ids: Array<string>) {
    return this.workExperienceService.remove(ids);
  }
}
