import { Module } from '@nestjs/common';
import { JobService } from './job.service';
import { JobController } from './job.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Job, JobSchema } from './schema/Job.schema';
import { UsersModule } from '../users/users.module';
import { CitiesModule } from '../cities/cities.module';
import { LevelModule } from '../level/level.module';
import { SkillEmployerModule } from '../skill_employer/skill.module';
import { ApplicationModule } from '../application/application.module';
import { LogService } from 'src/log/log.service';
import { LogModule } from 'src/log/log.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Job.name, schema: JobSchema }]),
    UsersModule,
    CitiesModule,
    LevelModule,
    SkillEmployerModule,
    LogModule,
  ],
  controllers: [JobController],
  providers: [JobService],
  exports: [MongooseModule],
})
export class JobModule {}
