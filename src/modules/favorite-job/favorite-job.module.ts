import { Module } from '@nestjs/common';
import { FavoriteJobService } from './favorite-job.service';
import { FavoriteJobController } from './favorite-job.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { FavoriteJob, FavoriteJobSchema } from './schema/favorite-job.schema';
import { UsersModule } from '../users/users.module';
import { LogModule } from 'src/log/log.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: FavoriteJob.name,
        schema: FavoriteJobSchema,
      },
    ]),
    UsersModule,
    LogModule,
  ],
  controllers: [FavoriteJobController],
  providers: [FavoriteJobService],
})
export class FavoriteJobModule {}
