import { PartialType } from '@nestjs/swagger';
import { CreateSaveCandidateDto } from './create-save_candidate.dto';

export class UpdateSaveCandidateDto extends PartialType(CreateSaveCandidateDto) {}
