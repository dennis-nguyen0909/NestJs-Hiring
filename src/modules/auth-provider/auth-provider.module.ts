import { Module } from '@nestjs/common';
import { AuthProviderService } from './auth-provider.service';
import { AuthProviderController } from './auth-provider.controller';

@Module({
  controllers: [AuthProviderController],
  providers: [AuthProviderService],
})
export class AuthProviderModule {}
