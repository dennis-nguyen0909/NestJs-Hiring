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
import { ResponseMessage } from 'src/decorator/customize';
import { Project } from './schema/project.schema';
import { Meta } from '../types';

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  @ResponseMessage('success')
  async create(@Body() createProjectDto: CreateProjectDto): Promise<Project> {
    return await this.projectService.create(createProjectDto);
  }

  @Get()
  @ResponseMessage('success')
  async findAll(
    @Query('query') query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ): Promise<{ items: Project[]; meta: Meta }> {
    return await this.projectService.findAll(query, +current, +pageSize);
  }

  @Get(':id')
  @ResponseMessage('success')
  async findOne(@Param('id') id: string): Promise<Project> {
    return await this.projectService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('success')
  async update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ): Promise<Project> {
    return await this.projectService.update(id, updateProjectDto);
  }

  @Delete(':id')
  @ResponseMessage('success')
  async remove(@Param('id') id: string, @Req() req: any): Promise<void> {
    const userId = req.user._id;
    return await this.projectService.remove(id, userId);
  }
}
