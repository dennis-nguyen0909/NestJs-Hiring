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
import { SkillService } from './skill.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from 'src/decorator/customize';
import { DeleteSkillDto } from './dto/delete-skill.dto';
import { Skill } from './schema/Skill.schema';
import { Meta } from '../types';

@Controller('skills')
@ApiTags('Skill')
export class SkillController {
  constructor(private readonly skillService: SkillService) {}

  @Post()
  @ResponseMessage('Success')
  async create(@Body() createSkillDto: CreateSkillDto): Promise<Skill> {
    return await this.skillService.create(createSkillDto);
  }
  @Get('user')
  @ResponseMessage('Success')
  async getSkillsByUserId(@Request() req): Promise<any> {
    console.log('req.user', req.user);
    return await this.skillService.getSkillsByUserId(req.user._id);
  }

  @Get('suggestions')
  @ResponseMessage('Success')
  async getSkillSuggestions(
    @Query('keyword') keyword: string,
  ): Promise<Skill[]> {
    return await this.skillService.getSkillSuggestions(keyword);
  }

  @Get(':id')
  @ResponseMessage('Success')
  async findOne(@Param('id') id: string): Promise<Skill> {
    return await this.skillService.findOne(id);
  }

  @Get('candidate/search')
  @ResponseMessage('Success')
  async getCandidatesBySkills(
    @Query() query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ): Promise<any> {
    return await this.skillService.getCandidatesBySkills(
      query,
      +current,
      +pageSize,
    );
  }

  @Get()
  @ResponseMessage('Success')
  async findAll(
    @Query() query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ): Promise<{ items: Skill[]; meta: Meta }> {
    return await this.skillService.findAll(query, +current, +pageSize);
  }

  @Patch(':id')
  @ResponseMessage('Success')
  async update(
    @Param('id') id: string,
    @Body() updateSkillDto: UpdateSkillDto,
  ): Promise<Skill> {
    return await this.skillService.update(id, updateSkillDto);
  }

  @Delete()
  @ResponseMessage('Success')
  async remove(@Body() data: DeleteSkillDto): Promise<[]> {
    return await this.skillService.remove(data);
  }

  @Get('candidate/:id')
  @ResponseMessage('Success')
  async getCandidateSkills(@Param('id') id: string): Promise<Skill[]> {
    return await this.skillService.getSkillsByUserId(id);
  }
}
