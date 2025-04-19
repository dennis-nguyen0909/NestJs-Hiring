import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSaveCandidateDto } from './dto/create-save_candidate.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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
      // Kiểm tra xem data.employer có hợp lệ không (có thể là ObjectId hợp lệ)
      const employerId = Types.ObjectId.isValid(data.employer)
        ? new Types.ObjectId(data.employer)
        : null;

      if (!employerId) {
        throw new BadRequestException('Invalid employer ID');
      }

      const res = await this.modelSaveCandidate.create({
        employer: employerId,
        ...data,
      });

      if (!res) {
        throw new BadRequestException('Failed to save candidate');
      }

      return res;
    } catch (error) {
      throw new BadRequestException(
        error.message || 'An error occurred while saving the candidate',
      );
    }
  }

  async toggleSaveCandidate(
    employerId: string,
    candidateId: string,
  ): Promise<{ action: 'saved' | 'removed'; data: SaveCandidate | null }> {
    try {
      // Validate IDs
      if (
        !Types.ObjectId.isValid(employerId) ||
        !Types.ObjectId.isValid(candidateId)
      ) {
        throw new BadRequestException('Invalid employer or candidate ID');
      }

      // Check if the save candidate record already exists
      const existingRecord = await this.modelSaveCandidate.findOne({
        employer: new Types.ObjectId(employerId),
        candidate: new Types.ObjectId(candidateId),
      });

      if (existingRecord) {
        // If record exists, delete it (toggle off)
        await this.modelSaveCandidate.findByIdAndDelete(existingRecord._id);
        return { action: 'removed', data: null };
      } else {
        // If record doesn't exist, create it (toggle on)
        const newRecord = await this.modelSaveCandidate.create({
          employer: new Types.ObjectId(employerId),
          candidate: new Types.ObjectId(candidateId),
          isActive: true,
        });
        return { action: 'saved', data: newRecord };
      }
    } catch (error) {
      throw new BadRequestException(
        error.message || 'An error occurred while toggling the save candidate',
      );
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

      // Calculate total items and pages
      const totalItems = await this.modelSaveCandidate.countDocuments({
        employer: new Types.ObjectId(id),
        ...filter,
      });
      const totalPages = Math.ceil(totalItems / pageSize);
      const skip = (current - 1) * pageSize;

      // Get paginated results
      const result = await this.modelSaveCandidate
        .find({ employer: new Types.ObjectId(id), ...filter })
        .limit(pageSize)
        .skip(skip)
        .sort(sortOption as any)
        .populate({
          path: 'employer',
          select: 'avatar full_name _id',
        })
        .populate({
          path: 'candidate',
          select: 'avatar full_name _id',
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

  async isCandidateSaved(
    employerId: string,
    candidateId: string,
  ): Promise<boolean> {
    try {
      // Validate IDs
      if (
        !Types.ObjectId.isValid(employerId) ||
        !Types.ObjectId.isValid(candidateId)
      ) {
        return false;
      }

      // Check if the save candidate record exists
      const existingRecord = await this.modelSaveCandidate.findOne({
        employer: new Types.ObjectId(employerId),
        candidate: new Types.ObjectId(candidateId),
      });

      return !!existingRecord;
    } catch (error) {
      console.error('Error checking if candidate is saved:', error);
      return false;
    }
  }

  async getSavedCandidatesByEmployer(employerId: string): Promise<string[]> {
    try {
      // Validate employer ID
      if (!Types.ObjectId.isValid(employerId)) {
        return [];
      }

      // Find all saved candidates for this employer
      const savedCandidates = await this.modelSaveCandidate.find({
        employer: new Types.ObjectId(employerId),
      });

      // Extract candidate IDs
      return savedCandidates.map((record) => record.candidate.toString());
    } catch (error) {
      console.error('Error getting saved candidates:', error);
      return [];
    }
  }
}
