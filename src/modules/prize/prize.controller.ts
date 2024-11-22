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

@Controller('prizes')
export class PrizeController {
  constructor(private readonly prizeService: PrizeService) {}

  @Post()
  @ResponseMessage('Success')
  create(@Body() createPrizeDto: CreatePrizeDto) {
    return this.prizeService.create(createPrizeDto);
  }

  @Get()
  @ResponseMessage('Success')
  findAll(
    @Query('query') query,
    @Query('current') current,
    @Query('pageSize') pageSize,
  ) {
    return this.prizeService.findAll(query, +current, +pageSize);
  }

  @Get('owner/:id')
  @ResponseMessage('success')
  async findByUserId(@Param('owner_id') id: string) {
    return await this.prizeService.findByOwner(id);
  }

  @Get(':id')
  @ResponseMessage('Success')
  findOne(@Param('id') id: string) {
    return this.prizeService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Success')
  update(@Param('id') id: string, @Body() updatePrizeDto: UpdatePrizeDto) {
    return this.prizeService.update(id, updatePrizeDto);
  }

  @Delete(':id')
  @ResponseMessage('Success')
  remove(@Param('id') id: string, @Req() req: any) {
    const userId = req.user._id;

    return this.prizeService.remove(id, userId);
  }
}
