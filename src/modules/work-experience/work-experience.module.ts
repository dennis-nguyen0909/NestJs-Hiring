import { Module } from '@nestjs/common';
import { WorkExperienceService } from './work-experience.service';
import { WorkExperienceController } from './work-experience.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  WorkExperience,
  WorkExperienceSchema,
} from './schema/WorkExperience.schema';
import { UsersModule } from '../users/users.module';
import { LogModule } from 'src/log/log.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WorkExperience.name, schema: WorkExperienceSchema },
    ]),
    UsersModule,
    LogModule,
  ],
  controllers: [WorkExperienceController],
  providers: [WorkExperienceService],
})
export class WorkExperienceModule {}
