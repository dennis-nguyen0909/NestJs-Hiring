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
