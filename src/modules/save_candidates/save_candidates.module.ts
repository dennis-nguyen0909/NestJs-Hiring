import { Module } from '@nestjs/common';
import { SaveCandidatesService } from './save_candidates.service';
import { SaveCandidatesController } from './save_candidates.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  SaveCandidate,
  SaveCandidateSchema,
} from './schema/SaveCandidates.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: SaveCandidate.name,
        schema: SaveCandidateSchema,
      },
    ]),
  ],
  controllers: [SaveCandidatesController],
  providers: [SaveCandidatesService],
  exports: [SaveCandidatesService, MongooseModule], // Export MongooseModule để các module khác có thể sử dụng model
})
export class SaveCandidatesModule {}
