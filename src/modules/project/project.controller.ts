import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ResponseMessage, Public } from 'src/decorator/customize';

@Controller('projects')
// @Public()
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  @ResponseMessage('success')
  create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectService.create(createProjectDto);
  }

  @Get()
  @ResponseMessage('success')
  findAll(
    @Query('query') query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.projectService.findAll(query, +current, +pageSize);
  }

  @Get(':id')
  @ResponseMessage('success')
  findOne(@Param('id') id: string) {
    return this.projectService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('success')
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectService.update(id, updateProjectDto);
  }

  @Delete(':id')
  @ResponseMessage('success')
  remove(@Param('id') id: string, @Req() req: any) {
    const userId = req.user._id;
    return this.projectService.remove(id, userId);
  }
}
