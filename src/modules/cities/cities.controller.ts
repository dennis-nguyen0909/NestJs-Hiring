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
import { CitiesService } from './cities.service';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { Public, ResponseMessage } from 'src/decorator/customize';
@Controller('cities')
@Public()
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Post()
  async create(@Body() createCityDto: CreateCityDto) {
    return await this.citiesService.create(createCityDto);
  }

  @Get('/:city_id/districts')
  async findDistrictsByCityId(@Param('city_id') cityId: string) {
    return await this.citiesService.findDistrictsByCityId(cityId);
  }

  @Get()
  @ResponseMessage('success')
  async findAll(@Query('depth') depth: number = 3) {
    return await this.citiesService.findAll(+depth);
  }

  @Get('find-by-code/:code')
  async findByCode(@Param('code') code: string) {
    return await this.citiesService.findByCode(+code);
  }

  @Get()
  async findOne(@Query() query: any) {
    const city = await await this.citiesService.findOne(query);
    return city;
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateCityDto: UpdateCityDto) {
    return await this.citiesService.update(id, updateCityDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.citiesService.remove(id);
  }
}
