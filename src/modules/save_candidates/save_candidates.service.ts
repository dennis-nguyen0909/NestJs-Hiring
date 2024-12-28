import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSaveCandidateDto } from './dto/create-save_candidate.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SaveCandidate } from './schema/SaveCandidates.schema';
import aqp from 'api-query-params';
import { ISaveCandidatesService } from './save_candidates.interface';
import { Meta } from '../types';

@Injectable()
export class SaveCandidatesService implements ISaveCandidatesService {
  constructor(
    @InjectModel(SaveCandidate.name)
    private modelSaveCandidate: Model<SaveCandidate>,
  ) {}

  async saveCandidate(data: CreateSaveCandidateDto): Promise<SaveCandidate> {
    try {
      const res = await this.modelSaveCandidate.create(data);
      if (!res) {
        throw new BadRequestException('Failed');
      }
      return res;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
  async findAll(
    query: string,
    current: number,
    pageSize: number,
  ): Promise<{ items: SaveCandidate[]; meta: Meta }> {
    const { filter, sort } = aqp(query);
    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;
    if (!current) current = 1;
    if (!pageSize) pageSize = 10;
    const defaultSort = '-createdAt';
    const sortOption = sort || defaultSort;
    const totalItems = (await this.modelSaveCandidate.find(filter)).length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (+current - 1) * pageSize;
    const result = await this.modelSaveCandidate
      .find(filter)
      .limit(pageSize)
      .skip(skip)
      .sort(sortOption as any);
    return {
      items: result,
      meta: {
        count: result.length,
        current_page: current,
        per_page: pageSize,
        total: totalItems,
        total_pages: totalPages,
      },
    };
  }

  async findAllByEmployer(
    id: string,
    query: string,
    current: number,
    pageSize: number,
  ): Promise<{ items: SaveCandidate[]; meta: Meta }> {
    try {
      const { filter, sort } = aqp(query);
      if (filter.current) delete filter.current;
      if (filter.pageSize) delete filter.pageSize;
      if (!current) current = 1;
      if (!pageSize) pageSize = 10;
      const defaultSort = '-createdAt';
      const sortOption = sort || defaultSort;
      const totalItems = (
        await this.modelSaveCandidate.find({ employer: id, ...filter })
      ).length;
      const totalPages = Math.ceil(totalItems / pageSize);
      const skip = (+current - 1) * pageSize;
      const result = await this.modelSaveCandidate
        .find({ employer: id, ...filter })
        .limit(pageSize)
        .skip(skip)
        .sort(sortOption as any)
        .populate({
          path: 'employer',
          select: '-createdAt -updatedAt -password',
        })
        .populate({
          path: 'candidate',
          select: '-createdAt -updatedAt -password',
        });
      return {
        items: result,
        meta: {
          count: result.length,
          current_page: current,
          per_page: pageSize,
          total: totalItems,
          total_pages: totalPages,
        },
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
