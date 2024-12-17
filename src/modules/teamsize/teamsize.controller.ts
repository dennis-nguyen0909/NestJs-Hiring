import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public, ResponseMessage } from 'src/decorator/customize';
import { TeamsizeService } from './teamsize.service';
import { CreateTeamsizeDto } from './dto/create-teamsize.dto';
import { UpdateTeamsizeDto } from './dto/update-teamsize.dto';
@Controller('team-sizes')
@ApiTags('Teamsizes')
@Public()
export class TeamsizeController {
  constructor(private readonly teamSizeService: TeamsizeService) {}

  @Post()
  @ResponseMessage('Success')
  async create(@Body() createDto: CreateTeamsizeDto) {
    return await this.teamSizeService.create(createDto);
  }

  @Get()
  @ResponseMessage('Success')
  async findAll(
    @Query('query') query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return await this.teamSizeService.findAll(query, +current, +pageSize);
  }

  @Get(':id')
  @ResponseMessage('Success')
  async findOne(@Param('id') id: string) {
    return await this.teamSizeService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Success')
  async update(@Param('id') id: string, @Body() updateDto: UpdateTeamsizeDto) {
    return await this.teamSizeService.update(id, updateDto);
  }

  @Delete()
  @ResponseMessage('Success')
  async remove(@Body('ids') ids: Array<string>) {
    return await this.teamSizeService.remove(ids);
  }
}