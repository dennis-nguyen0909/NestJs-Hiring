import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  NotFoundException,
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
  create(@Body() createCityDto: CreateCityDto) {
    return this.citiesService.create(createCityDto);
  }

  @Get('/:city_id/districts')
  async findDistrictsByCityId(@Param('city_id') cityId: string) {
    return this.citiesService.findDistrictsByCityId(cityId);
  }

  @Get()
  @ResponseMessage('success')
  async findAll(@Query('depth') depth: number = 3) {
    return this.citiesService.findAll(+depth);
  }

  @Get('find-by-code/:code')
  async findByCode(@Param('code') code: string) {
    return this.citiesService.findByCode(+code);
  }

  @Get()
  async findOne(@Query() query: any) {
    const city = await this.citiesService.findOne(query);
    return city;
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCityDto: UpdateCityDto) {
    return this.citiesService.update(id, updateCityDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.citiesService.remove(id);
  }
}
