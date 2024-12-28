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
import { SkillEmployerServices } from './skill.service';
import { CreateSkillEmployerDto } from './dto/create-skill.dto';
import { UpdateSkillEmployerDto } from './dto/update-skill.dto';
import { ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from 'src/decorator/customize';
import { DeleteSkillEmployerDto } from './dto/delete-skill.dto';
import { SkillEmployer } from './schema/EmployerSkill.schema';
import { Meta } from '../types';

@Controller('employer/skills')
@ApiTags('Employer Skills')
export class SkillEmployerController {
  constructor(private readonly skillService: SkillEmployerServices) {}

  @Post()
  @ResponseMessage('Success')
  async create(
    @Body() CreateSkillEmployerDto: CreateSkillEmployerDto,
  ): Promise<SkillEmployer> {
    return await this.skillService.create(CreateSkillEmployerDto);
  }

  @Get()
  @ResponseMessage('Success')
  async findAll(
    @Query() query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ): Promise<{ items: SkillEmployer[]; meta: Meta }> {
    return await this.skillService.findAll(query, +current, +pageSize);
  }

  @Get('user')
  @ResponseMessage('Success')
  async getSkillsByUserId(
    @Request() req,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
    @Query('query') query: string,
  ): Promise<{ items: SkillEmployer[]; meta: Meta }> {
    return await this.skillService.getSkillsByUserId(
      req.user._id,
      +current,
      +pageSize,
      query,
    );
  }

  @Get(':id')
  @ResponseMessage('Success')
  async findOne(@Param('id') id: string): Promise<SkillEmployer> {
    return await this.skillService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Success')
  async update(
    @Param('id') id: string,
    @Body() UpdateSkillEmployerDto: UpdateSkillEmployerDto,
  ): Promise<SkillEmployer> {
    return await this.skillService.update(id, UpdateSkillEmployerDto);
  }

  @Delete()
  @ResponseMessage('Success')
  async remove(@Body() data: DeleteSkillEmployerDto): Promise<[]> {
    return await this.skillService.remove(data);
  }
}
