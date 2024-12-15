import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/User.schema';
import { RoleModule } from '../role/role.module';
import { AuthProviderModule } from '../auth-provider/auth-provider.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    RoleModule,
    AuthProviderModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService, UsersModule, MongooseModule],
})
export class UsersModule {}
