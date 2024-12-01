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
import { FavoriteJobService } from './favorite-job.service';
import { CreateFavoriteJobDto } from './dto/create-favorite-job.dto';
import { UpdateFavoriteJobDto } from './dto/update-favorite-job.dto';
import { ResponseMessage } from 'src/decorator/customize';

@Controller('favorite-jobs')
export class FavoriteJobController {
  constructor(private readonly favoriteJobService: FavoriteJobService) {}

  @Post()
  @ResponseMessage('Success')
  create(@Body() createFavoriteJobDto: CreateFavoriteJobDto) {
    return this.favoriteJobService.create(createFavoriteJobDto);
  }

  @Get('/get-detail')
  @ResponseMessage('Success')
  getFavoriteJobDetailByUserId(
    @Query('user_id') user_id: any,
    @Query('job_id') job_id: any,
  ) {
    const data: CreateFavoriteJobDto = {
      user_id,
      job_id,
    };
    return this.favoriteJobService.getFavoriteJobDetailByUserId(data);
  }

  @Get()
  findAll(
    @Query('query') query: string,
    @Query('current') current,
    @Query('pageSize') pageSize,
  ) {
    return this.favoriteJobService.findAll(query, +current, +pageSize);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.favoriteJobService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFavoriteJobDto: UpdateFavoriteJobDto,
  ) {
    return this.favoriteJobService.update(+id, updateFavoriteJobDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.favoriteJobService.remove(+id);
  }
}
