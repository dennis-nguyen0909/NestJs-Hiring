import { Module } from '@nestjs/common';
import { LevelService } from './level.service';
import { LevelController } from './level.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Level, LevelSchema } from './schema/Level.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Level.name,
        schema: LevelSchema,
      },
    ]),
  ],
  controllers: [LevelController],
  providers: [LevelService],
  exports: [MongooseModule],
})
export class LevelModule {}
