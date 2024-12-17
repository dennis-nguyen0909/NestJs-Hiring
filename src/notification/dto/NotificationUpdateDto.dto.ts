import { PartialType } from '@nestjs/mapped-types';
import { NotificationCreateDto } from './NotificationCreateDto.dto';
import { IsArray, IsMongoId } from 'class-validator';

export class NotificationUpdateDto extends PartialType(NotificationCreateDto) {}
export class UpdateReadStatusDto {
  @IsArray()
  notification_ids: string[];
}
