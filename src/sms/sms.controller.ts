import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SmsService } from './sms.service';
import { CreateSmDto } from './dto/create-sm.dto';
import { UpdateSmDto } from './dto/update-sm.dto';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/decorator/customize';
@Controller('sms')
@ApiTags('sms')
@Public()
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @Post()
  sendOTP(@Body() data: any) {
    console.log('phone', data);
    const { phoneNumber } = data;
    return this.smsService.sendSms(phoneNumber, '12312');
  }
}
