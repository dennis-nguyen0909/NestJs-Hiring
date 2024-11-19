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

@Controller('employer/skills')
@ApiTags('Employer Skills')
export class SkillEmployerController {
  constructor(private readonly skillService: SkillEmployerServices) {}

  @Post()
  @ResponseMessage('Success')
  create(@Body() CreateSkillEmployerDto: CreateSkillEmployerDto) {
    return this.skillService.create(CreateSkillEmployerDto);
  }

  @Get()
  @ResponseMessage('Success')
  findAll(
    @Query() query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.skillService.findAll(query, +current, +pageSize);
  }

  @Get('user')
  @ResponseMessage('Success')
  getSkillsByUserId(
    @Request() req,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
    @Query('query') query: string,
  ) {
    return this.skillService.getSkillsByUserId(
      req.user._id,
      +current,
      +pageSize,
      query,
    );
  }

  @Get(':id')
  @ResponseMessage('Success')
  findOne(@Param('id') id: string) {
    return this.skillService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Success')
  update(
    @Param('id') id: string,
    @Body() UpdateSkillEmployerDto: UpdateSkillEmployerDto,
  ) {
    return this.skillService.update(id, UpdateSkillEmployerDto);
  }

  @Delete()
  @ResponseMessage('Success')
  remove(@Body() data: DeleteSkillEmployerDto) {
    return this.skillService.remove(data);
  }
}
