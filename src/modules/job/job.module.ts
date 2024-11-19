import { Module } from '@nestjs/common';
import { JobService } from './job.service';
import { JobController } from './job.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Job, JobSchema } from './schema/Job.schema';
import { UsersModule } from '../users/users.module';
import { CitiesModule } from '../cities/cities.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Job.name, schema: JobSchema }]),
    UsersModule,
    CitiesModule,
  ],
  controllers: [JobController],
  providers: [JobService],
})
export class JobModule {}
