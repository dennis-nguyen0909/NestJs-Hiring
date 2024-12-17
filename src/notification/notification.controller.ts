import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';
import { NotificationService } from './notification.service';
import { Public, ResponseMessage } from 'src/decorator/customize';
import { UpdateAuthProviderDto } from 'src/modules/auth-provider/dto/update-auth-provider.dto';
import {
  NotificationUpdateDto,
  UpdateReadStatusDto,
} from './dto/NotificationUpdateDto.dto';

@Controller('notifications')
@Public()
export class NotificationController {
  constructor(
    private readonly notificationGateway: NotificationGateway,
    private notificationService: NotificationService,
  ) {}

  async notifyCandidateAboutProfileView(
    candidateId: string,
    employerId: string,
  ) {
    const message = `Nhà tuyển dụng ${employerId} đã xem hồ sơ của ${candidateId}.`;
    // Gửi thông báo real-time tới ứng viên
    await this.notificationGateway.sendNotificationToCandidate(
      candidateId,
      message,
    );
  }
  @Get('')
  @ResponseMessage('Success')
  async getAll(
    @Query('query') query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return await this.notificationService.getAll(query, +current, +pageSize);
  }

  @Get('candidate/:id')
  @ResponseMessage('Success')
  async getNotificationForCandidate(
    @Query('query') query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
    @Param('id') candidateId: string,
  ) {
    return await this.notificationService.getNotificationsForCandidate(
      candidateId,
      query,
      +current,
      +pageSize,
    );
  }

  @Get('employer/:id')
  @ResponseMessage('Success')
  async getNotificationForEmployer(
    @Query('query') query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
    @Param('id') employerId: string,
  ) {
    return await this.notificationService.getNotificationsForEmployer(
      employerId,
      query,
      +current,
      +pageSize,
    );
  }

  @Patch('mark-as-read')
  async markNotificationsAsRead(
    @Body() updateReadStatusDto: UpdateReadStatusDto,
  ) {
    return this.notificationService.updateReadStatus(updateReadStatusDto);
  }

  @Patch(':id')
  @ResponseMessage('Success')
  async update(
    @Param('id') id: string,
    @Body() updateDto: NotificationUpdateDto,
  ) {
    return await this.notificationService.update(id, updateDto);
  }
}
