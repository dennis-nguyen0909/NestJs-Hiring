import { Module } from '@nestjs/common';
import { FollowService } from './follow.service';
import { FollowController } from './follow.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Follow, FollowSchema } from './schema/Follow.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Follow.name,
        schema: FollowSchema,
      },
    ]),
    UsersModule,
  ],
  controllers: [FollowController],
  providers: [FollowService],
})
export class FollowModule {}
