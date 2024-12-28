import { CreateSaveCandidateDto } from './dto/create-save_candidate.dto';
import { SaveCandidate } from './schema/SaveCandidates.schema';

export interface ISaveCandidatesService {
  saveCandidate(data: CreateSaveCandidateDto): Promise<SaveCandidate>;

  findAll(
    query: string,
    current: number,
    pageSize: number,
  ): Promise<{ items: SaveCandidate[]; meta: any }>;

  findAllByEmployer(
    id: string,
    query: string,
    current: number,
    pageSize: number,
  ): Promise<{ items: SaveCandidate[]; meta: any }>;
}
