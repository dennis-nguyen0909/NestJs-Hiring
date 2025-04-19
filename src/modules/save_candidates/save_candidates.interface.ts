import { CreateSaveCandidateDto } from './dto/create-save_candidate.dto';
import { SaveCandidate } from './schema/SaveCandidates.schema';

export interface ISaveCandidatesService {
  saveCandidate(data: CreateSaveCandidateDto): Promise<SaveCandidate>;

  toggleSaveCandidate(
    employerId: string,
    candidateId: string,
  ): Promise<{ action: 'saved' | 'removed'; data: SaveCandidate | null }>;

  isCandidateSaved(employerId: string, candidateId: string): Promise<boolean>;

  getSavedCandidatesByEmployer(employerId: string): Promise<string[]>;

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
