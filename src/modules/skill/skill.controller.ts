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

@Controller('skills')
@ApiTags('Skill')
export class SkillController {
  constructor(private readonly skillService: SkillService) {}

  @Post()
  @ResponseMessage('Success')
  async create(@Body() createSkillDto: CreateSkillDto) {
    return await this.skillService.create(createSkillDto);
  }

  @Get()
  @ResponseMessage('Success')
  async findAll(
    @Query() query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return await this.skillService.findAll(query, +current, +pageSize);
  }

  @Get('user')
  @ResponseMessage('Success')
  async getSkillsByUserId(@Request() req) {
    return await this.skillService.getSkillsByUserId(req.user._id);
  }

  @Get(':id')
  @ResponseMessage('Success')
  async findOne(@Param('id') id: string) {
    return await this.skillService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Success')
  async update(
    @Param('id') id: string,
    @Body() updateSkillDto: UpdateSkillDto,
  ) {
    return await this.skillService.update(id, updateSkillDto);
  }

  @Delete()
  @ResponseMessage('Success')
  async remove(@Body() data: DeleteSkillDto) {
    return await this.skillService.remove(data);
  }
}
