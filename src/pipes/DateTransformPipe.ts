// dayjs-transform.pipe.ts
import {
  ArgumentMetadata,
  Injectable,
  PipeTransform,
  BadRequestException,
} from '@nestjs/common';
import * as dayjs from 'dayjs';
import 'dayjs/locale/en'; // Import locale nếu cần (ví dụ: 'vi')

@Injectable()
export class DayjsTransformPipe implements PipeTransform {
  constructor(private readonly format: string) {}

  transform(value: any, metadata: ArgumentMetadata): Date | undefined {
    if (value === null || value === undefined) {
      return undefined; // Cho phép giá trị null hoặc undefined nếu trường là optional
    }

    if (typeof value !== 'string') {
      throw new BadRequestException(
        `Validation failed (string is expected for ${metadata.data})`,
      );
    }

    const parsedDate = dayjs(value, this.format, true); // 'true' để bật strict parsing

    if (!parsedDate.isValid()) {
      throw new BadRequestException(
        `Validation failed (date string with format ${this.format} is expected for ${metadata.data})`,
      );
    }

    return parsedDate.toDate(); // Chuyển về đối tượng Date của JavaScript
  }
}
