import { Module } from '@nestjs/common';
import { JobTypeService } from './job-type.service';
import { JobTypeController } from './job-type.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { JobType, JobTypeSchema } from './schema/JobType.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: JobType.name,
        schema: JobTypeSchema,
      },
    ]),
  ],
  controllers: [JobTypeController],
  providers: [JobTypeService],
})
export class JobTypeModule {}
