import { Module } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { ApplicationController } from './application.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Application, ApplicationSchema } from './schema/Application.schema';
import {
  CompanyApplicationStatus,
  CompanyApplicationStatusSchema,
} from './schema/CompanyApplicationStatus.schema';
import { SaveCandidatesModule } from '../save_candidates/save_candidates.module';
import { JobModule } from '../job/job.module';
import { NotificationModule } from 'src/notification/notification.module';
import { UsersModule } from '../users/users.module';
import { LogModule } from 'src/log/log.module';
import { CompanyStatusService } from './company-status.service';
import { CompanyStatusController } from './company-status.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Application.name, schema: ApplicationSchema },
      {
        name: CompanyApplicationStatus.name,
        schema: CompanyApplicationStatusSchema,
      },
    ]),
    SaveCandidatesModule,
    JobModule,
    NotificationModule,
    UsersModule,
    LogModule,
  ],
  controllers: [ApplicationController, CompanyStatusController],
  providers: [ApplicationService, CompanyStatusService],
  exports: [MongooseModule],
})
export class ApplicationModule {}
