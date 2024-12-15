import { Module } from '@nestjs/common';
import { AuthProviderService } from './auth-provider.service';
import { AuthProviderController } from './auth-provider.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthProvider, AuthProviderSchema } from './schema/AuthProvider.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AuthProvider.name, schema: AuthProviderSchema },
    ]),
  ],
  controllers: [AuthProviderController],
  providers: [AuthProviderService, AuthProviderModule],
  exports: [AuthProviderModule, AuthProviderService],
})
export class AuthProviderModule {}
