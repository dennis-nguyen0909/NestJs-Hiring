// src/sms.service.ts

import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class SmsService {
  private readonly apiKey = 'YOUR_API_KEY';
  private readonly baseUrl = 'https://api.infobip.com/sms/1/text/single'; // Đường dẫn API của Infobip

  async sendSms(to: string, message: string) {
    const data = {
      to: to,
      text: message,
    };

    try {
      const response = await axios.post(this.baseUrl, data, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `App ${this.apiKey}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error sending SMS:', error.response.data);
      throw new Error('Failed to send SMS');
    }
  }
}
