import { Controller, Post, Body, Get, Query, Param } from '@nestjs/common';
import { SaveCandidatesService } from './save_candidates.service';
import { CreateSaveCandidateDto } from './dto/create-save_candidate.dto';
import { ResponseMessage } from 'src/decorator/customize';
import { Public } from 'src/decorator/customize';

@Controller('save-candidates')
@Public()
export class SaveCandidatesController {
  constructor(private readonly saveCandidatesService: SaveCandidatesService) {}

  @Post()
  @ResponseMessage('SUCCESS')
  saveCandidate(@Body() data: CreateSaveCandidateDto) {
    return this.saveCandidatesService.saveCandidate(data);
  }
  @Get('employer/:id')
  @ResponseMessage('SUCCESS')
  findAllByEmployer(
    @Param('id') id: string,
    @Query('query') query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.saveCandidatesService.findAllByEmployer(id, query, +current, +pageSize);
  }

  @Get()
  @ResponseMessage('SUCCESS')
  findAll(
    @Body() query: string,
    @Body() current: number,
    @Body() pageSize: number,
  ) {
    return this.saveCandidatesService.findAll(query, current, pageSize);
  }
}
