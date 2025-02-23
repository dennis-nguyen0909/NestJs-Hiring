import {
  Controller,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Get,
  Query,
} from '@nestjs/common';
import { LogService } from './log.service';
import { CreateLogDto } from './dto/create-log.dto';
import { UpdateLogDto } from './dto/update-log.dto';
import { Public, ResponseMessage } from 'src/decorator/customize';
import { query } from 'express';

@Controller('logs')
export class LogController {
  constructor(private readonly logService: LogService) {}

  // Tạo mới log
  @Post()
  @ResponseMessage('Create log success')
  async createLog(@Body() createLogDto: CreateLogDto) {
    return await this.logService.createLog(createLogDto);
  }

  // Cập nhật log
  @Put(':id')
  @ResponseMessage('Update log success')
  async updateLog(@Param('id') id: string, @Body() updateLogDto: UpdateLogDto) {
    return await this.logService.updateLog(id, updateLogDto);
  }

  // Xóa log
  @Delete(':id')
  @ResponseMessage('Delete log success')
  async deleteLog(@Param('id') id: string) {
    return await this.logService.deleteLog(id);
  }

  // Tìm kiếm log
  @Get('search')
  @ResponseMessage('Search logs success')
  async searchLogs(@Query() query: any) {
    return await this.logService.searchLogs(query);
  }

  // Ghi log bật/tắt thông báo
  @Post('toggle-notification')
  @ResponseMessage('Toggle notification log success')
  async toggleNotification(
    @Body('userId') userId: string,
    @Body('status') status: string,
  ) {
    return await this.logService.toggleNotificationLog(userId, status);
  }

  @Get('system-activities')
  @ResponseMessage('Get user activity success')
  @Public()
  async getUserActivity(
    @Query('current') current: number,
    @Query('pageSize') pageSize: number,
    @Query('query') query: string,
  ) {
    return await this.logService.getUserActivity(+current, +pageSize, query);
  }
}
