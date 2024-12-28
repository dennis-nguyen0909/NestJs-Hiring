import { Module } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { ApplicationController } from './application.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Application, ApplicationSchema } from './schema/Application.schema';
import { SaveCandidatesModule } from '../save_candidates/save_candidates.module';
import { JobModule } from '../job/job.module';
import { NotificationModule } from 'src/notification/notification.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Application.name, schema: ApplicationSchema },
    ]),
    SaveCandidatesModule,
    JobModule,
    NotificationModule,
    UsersModule,
  ],
  controllers: [ApplicationController],
  providers: [ApplicationService],
  exports: [MongooseModule],
})
export class ApplicationModule {}
