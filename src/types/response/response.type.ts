import { ApiProperty } from '@nestjs/swagger';

/** Wrapper cho Response Thành Công */
export class SuccessResponse<T> {
  @ApiProperty({ description: 'Dữ liệu trả về', example: {} })
  data: T;

  @ApiProperty({ description: 'Trạng thái thành công', example: true })
  success: boolean;

  @ApiProperty({
    description: 'Thông báo mô tả',
    example: 'Request thành công',
  })
  message: string;
}

/** Wrapper cho Response Lỗi */
export class ErrorResponse {
  @ApiProperty({ description: 'Mã lỗi', example: 400 })
  code: number;

  @ApiProperty({ description: 'Thông báo lỗi', example: 'Bad Request' })
  message: string;

  @ApiProperty({ description: 'HTTP Status Code', example: 400 })
  statusCode: number;

  @ApiProperty({ description: 'Trạng thái thành công', example: false })
  success: boolean;
}
