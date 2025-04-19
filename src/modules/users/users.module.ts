import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { Cities, CitiesSchema } from '../cities/schema/Cities.schema';
import { District, DistrictSchema } from '../districts/schema/District.schema';
import { RoleModule } from '../role/role.module';
import { AuthProviderModule } from '../auth-provider/auth-provider.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { NotificationModule } from 'src/notification/notification.module';
import { LogModule } from 'src/log/log.module';
import { CompanyStatusService } from '../application/company-status.service';
import {
  CompanyApplicationStatus,
  CompanyApplicationStatusSchema,
} from '../application/schema/CompanyApplicationStatus.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Cities.name, schema: CitiesSchema },
      { name: District.name, schema: DistrictSchema },
      {
        name: CompanyApplicationStatus.name,
        schema: CompanyApplicationStatusSchema,
      },
    ]),
    RoleModule,
    AuthProviderModule,
    CloudinaryModule,
    NotificationModule,
    LogModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, CompanyStatusService],
  exports: [UsersService, UsersModule, MongooseModule],
})
export class UsersModule {}
