import { HttpException, HttpStatus } from '@nestjs/common';

export class UserNotActiveException extends HttpException {
  constructor(id: string) {
    super(
      { message: 'User not active', userId: id, code: 'not_active' },
      HttpStatus.FORBIDDEN,
    );
  }
}
