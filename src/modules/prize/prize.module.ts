import { Module } from '@nestjs/common';
import { PrizeService } from './prize.service';
import { PrizeController } from './prize.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Prize, PrizeSchema } from './schema/prize.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Prize.name, schema: PrizeSchema }]),
    UsersModule,
  ],
  controllers: [PrizeController],
  providers: [PrizeService],
})
export class PrizeModule {}
