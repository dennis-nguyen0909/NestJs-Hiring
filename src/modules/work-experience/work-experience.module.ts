import { Module } from '@nestjs/common';
import { WorkExperienceService } from './work-experience.service';
import { WorkExperienceController } from './work-experience.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { WorkExperience, WorkExperienceSchema } from './schema/WorkExperience.schema';

@Module({
  imports: [
    // eslint-disable-next-line prettier/prettier
    MongooseModule.forFeature([{ name: WorkExperience.name, schema: WorkExperienceSchema }]),
  ],
  controllers: [WorkExperienceController],
  providers: [WorkExperienceService],
})
export class WorkExperienceModule {}
