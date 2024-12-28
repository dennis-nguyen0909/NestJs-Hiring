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
import { ResponseMessage } from 'src/decorator/customize';
import { CurrenciesService } from './currencies.service';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';
import { Currency } from './schema/currencies.schema';
import { Meta } from '../types';
@Controller('currencies')
@ApiTags('JobTypes')
export class CurrenciesController {
  constructor(private readonly currencyService: CurrenciesService) {}

  @Post()
  @ResponseMessage('Success')
  async create(@Body() createJobType: CreateCurrencyDto): Promise<Currency> {
    return await this.currencyService.create(createJobType);
  }

  @Get()
  @ResponseMessage('Success')
  async findAll(
    @Query('query') query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ): Promise<{ items: Currency[]; meta: Meta }> {
    return await this.currencyService.findAll(query, +current, +pageSize);
  }

  @Get(':id')
  @ResponseMessage('Success')
  async findOne(@Param('id') id: string): Promise<Currency> {
    return await this.currencyService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Success')
  async update(
    @Param('id') id: string,
    @Body() updateLevelDto: UpdateCurrencyDto,
  ): Promise<Currency> {
    return await this.currencyService.update(id, updateLevelDto);
  }

  @Delete()
  @ResponseMessage('Success')
  async remove(@Body('ids') ids: Array<string>): Promise<[]> {
    return await this.currencyService.remove(ids);
  }
}
