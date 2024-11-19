import { Module } from '@nestjs/common';
import { SkillEmployerServices } from './skill.service';
import { SkillEmployerController } from './skill.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  SkillEmployer,
  SkillEmployerSchema,
} from './schema/EmployerSkill.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SkillEmployer.name, schema: SkillEmployerSchema },
    ]),
    UsersModule,
  ],
  controllers: [SkillEmployerController],
  providers: [SkillEmployerServices],
})
export class SkillEmployerModule {}
