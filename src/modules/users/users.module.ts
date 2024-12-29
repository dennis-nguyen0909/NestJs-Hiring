import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { RoleModule } from '../role/role.module';
import { AuthProviderModule } from '../auth-provider/auth-provider.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    RoleModule,
    AuthProviderModule,
    CloudinaryModule,
    NotificationModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService, UsersModule, MongooseModule],
})
export class UsersModule {}
