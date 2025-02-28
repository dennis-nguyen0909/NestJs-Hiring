import { Module } from '@nestjs/common';
import { EducationService } from './education.service';
import { EducationController } from './education.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Education, EducationSchema } from './schema/Education.schema';
import { UsersModule } from '../users/users.module';
import { LogModule } from 'src/log/log.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Education.name, schema: EducationSchema },
    ]),
    UsersModule,
    LogModule,
  ],
  controllers: [EducationController],
  providers: [EducationService],
})
export class EducationModule {}
