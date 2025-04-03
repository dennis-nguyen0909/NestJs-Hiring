import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
} from '@nestjs/common';
import { FavoriteJobService } from './favorite-job.service';
import { CreateFavoriteJobDto } from './dto/create-favorite-job.dto';
import { UpdateFavoriteJobDto } from './dto/update-favorite-job.dto';
import { ResponseMessage } from 'src/decorator/customize';
import { FavoriteJob } from './schema/favorite-job.schema';
import { Meta } from '../types';
import { Request } from 'express';

@Controller('favorite-jobs')
export class FavoriteJobController {
  constructor(private readonly favoriteJobService: FavoriteJobService) {}

  @Post()
  @ResponseMessage('Success')
  async create(
    @Body() createFavoriteJobDto: CreateFavoriteJobDto,
    @Req() req: Request,
  ): Promise<FavoriteJob | []> {
    console.log('createFavoriteJobDto', createFavoriteJobDto);
    return await this.favoriteJobService.create(createFavoriteJobDto, req);
  }

  @Get('/get-detail')
  @ResponseMessage('Success')
  async getFavoriteJobDetailByUserId(
    @Query('user_id') user_id: any,
    @Query('job_id') job_id: any,
  ): Promise<FavoriteJob> {
    const data = {
      user_id,
      job_id,
    };
    return await this.favoriteJobService.getFavoriteJobDetailByUserId(data);
  }

  @Get()
  async findAll(
    @Query('query') query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ): Promise<{ items: FavoriteJob[]; meta: Meta }> {
    return await this.favoriteJobService.findAll(query, +current, +pageSize);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<FavoriteJob> {
    return await this.favoriteJobService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateFavoriteJobDto: UpdateFavoriteJobDto,
  ): Promise<FavoriteJob> {
    return await this.favoriteJobService.update(id, updateFavoriteJobDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<[]> {
    return await this.favoriteJobService.remove(id);
  }
}
