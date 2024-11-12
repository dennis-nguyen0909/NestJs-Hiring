import { Module } from '@nestjs/common';
import { SkillService } from './skill.service';
import { SkillController } from './skill.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Skill, SkillSchema } from './schema/Skill.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Skill.name, schema: SkillSchema }]),
    UsersModule,
  ],
  controllers: [SkillController],
  providers: [SkillService],
})
export class SkillModule {}
