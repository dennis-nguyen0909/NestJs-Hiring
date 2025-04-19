import { Controller, Post, Body, Get, Query, Param } from '@nestjs/common';
import { SaveCandidatesService } from './save_candidates.service';
import { CreateSaveCandidateDto } from './dto/create-save_candidate.dto';
import { ResponseMessage } from 'src/decorator/customize';
import { SaveCandidate } from './schema/SaveCandidates.schema';
import { Meta } from '../types';

@Controller('save-candidates')
export class SaveCandidatesController {
  constructor(private readonly saveCandidatesService: SaveCandidatesService) {}

  @Post()
  @ResponseMessage('SUCCESS')
  async saveCandidate(
    @Body() data: CreateSaveCandidateDto,
  ): Promise<SaveCandidate> {
    return await this.saveCandidatesService.saveCandidate(data);
  }

  @Post('toggle/:employerId/:candidateId')
  @ResponseMessage('SUCCESS')
  async toggleSaveCandidate(
    @Param('employerId') employerId: string,
    @Param('candidateId') candidateId: string,
  ): Promise<{ action: 'saved' | 'removed'; data: SaveCandidate | null }> {
    return await this.saveCandidatesService.toggleSaveCandidate(
      employerId,
      candidateId,
    );
  }

  @Get('check/:employerId/:candidateId')
  @ResponseMessage('SUCCESS')
  async isCandidateSaved(
    @Param('employerId') employerId: string,
    @Param('candidateId') candidateId: string,
  ): Promise<{ isSaved: boolean }> {
    const isSaved = await this.saveCandidatesService.isCandidateSaved(
      employerId,
      candidateId,
    );
    return { isSaved };
  }

  @Get('employer-saved/:employerId')
  @ResponseMessage('SUCCESS')
  async getSavedCandidatesByEmployer(
    @Param('employerId') employerId: string,
  ): Promise<{ savedCandidateIds: string[] }> {
    const savedCandidateIds =
      await this.saveCandidatesService.getSavedCandidatesByEmployer(employerId);
    return { savedCandidateIds };
  }

  @Get('employer/:id')
  @ResponseMessage('SUCCESS')
  async findAllByEmployer(
    @Param('id') id: string,
    @Query('query') query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ): Promise<{ items: SaveCandidate[]; meta: Meta }> {
    return await this.saveCandidatesService.findAllByEmployer(
      id,
      query,
      +current,
      +pageSize,
    );
  }

  @Get()
  @ResponseMessage('SUCCESS')
  async findAll(
    @Query('query') query: string,
    @Query('current') current: number,
    @Query('pageSize') pageSize: number,
  ): Promise<{ items: SaveCandidate[]; meta: Meta }> {
    return await this.saveCandidatesService.findAll(query, current, pageSize);
  }
}
