import { Module } from '@nestjs/common';
import { TeamsizeService } from './teamsize.service';
import { TeamsizeController } from './teamsize.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { TeamSize, TeamSizeSchema } from './schema/team_size.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TeamSize.name, schema: TeamSizeSchema },
    ]),
  ],
  controllers: [TeamsizeController],
  providers: [TeamsizeService],
})
export class TeamsizeModule {}
