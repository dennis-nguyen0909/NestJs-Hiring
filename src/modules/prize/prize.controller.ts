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

import { ResponseMessage } from 'src/decorator/customize';
import { PrizeService } from './prize.service';
import { CreatePrizeDto } from './dto/create-prize.dto';
import { UpdatePrizeDto } from './dto/update-prize.dto';
import { Prize } from './schema/prize.schema';
import { Meta } from '../types';

@Controller('prizes')
export class PrizeController {
  constructor(private readonly prizeService: PrizeService) {}

  @Post()
  @ResponseMessage('Success')
  async create(@Body() createPrizeDto: CreatePrizeDto): Promise<Prize> {
    return await this.prizeService.create(createPrizeDto);
  }

  @Get()
  @ResponseMessage('Success')
  async findAll(
    @Query('query') query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ): Promise<{ items: Prize[]; meta: Meta }> {
    return await this.prizeService.findAll(query, +current, +pageSize);
  }

  @Get('owner/:id')
  @ResponseMessage('success')
  async findByUserId(@Param('owner_id') id: string): Promise<Prize[]> {
    return await this.prizeService.findByOwner(id);
  }

  @Get(':id')
  @ResponseMessage('Success')
  async findOne(@Param('id') id: string): Promise<Prize> {
    return await this.prizeService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Success')
  async update(
    @Param('id') id: string,
    @Body() updatePrizeDto: UpdatePrizeDto,
  ): Promise<Prize> {
    return await this.prizeService.update(id, updatePrizeDto);
  }

  @Delete(':id')
  @ResponseMessage('Success')
  async remove(@Param('id') id: string, @Req() req: any): Promise<void> {
    const userId = req.user._id;

    return await this.prizeService.remove(id, userId);
  }
}
