import { Module } from '@nestjs/common';
import { EducationService } from './education.service';
import { EducationController } from './education.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Education, EducationSchema } from './schema/Education.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Education.name, schema: EducationSchema },
    ]),
    UsersModule,
  ],
  controllers: [EducationController],
  providers: [EducationService],
})
export class EducationModule {}
