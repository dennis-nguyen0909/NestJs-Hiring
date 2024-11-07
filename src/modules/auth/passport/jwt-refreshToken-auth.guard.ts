import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request: Request = context.switchToHttp().getRequest();
    const refreshToken = request.cookies.refresh_token; // Hoặc từ headers

    if (!refreshToken) {
      return false; // Nếu không có refresh token, không cho phép truy cập
    }

    // Bạn có thể kiểm tra refreshToken có hợp lệ không tại đây (ví dụ: ký, mã hóa)
    // Nếu hợp lệ thì trả về true để cho phép truy cập endpoint refresh token.
    return true;
  }
}
