import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import aqp from 'api-query-params';
import { TeamSize } from './schema/team_size.schema';
import { CreateTeamsizeDto } from './dto/create-teamsize.dto';
import { UpdateTeamsizeDto } from './dto/update-teamsize.dto';
import { ITeamsizeService } from './teamsize.interface';
import { Meta } from '../types';

@Injectable()
export class TeamsizeService implements ITeamsizeService {
  constructor(
    @InjectModel(TeamSize.name)
    private readonly teamSizeModel: Model<TeamSize>,
  ) {}
  async create(createDto: CreateTeamsizeDto): Promise<TeamSize> {
    const response = await this.teamSizeModel.create(createDto);
    if (!response) {
      throw new BadRequestException('Failed');
    }
    return response;
  }

  async findAll(
    query: string,
    current: number,
    pageSize: number,
  ): Promise<{ items: TeamSize[]; meta: Meta }> {
    const { filter, sort } = aqp(query);
    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;
    if (!current) current = 1;
    if (!pageSize) pageSize = 10;
    const totalItems = (await this.teamSizeModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (+current - 1) * pageSize;
    const result = await this.teamSizeModel
      .find(filter)
      .limit(pageSize)
      .skip(skip)
      .sort(sort as any);
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

  async findOne(id: string): Promise<TeamSize> {
    const response = await this.teamSizeModel.findOne({ _id: id });
    if (!response) {
      throw new NotFoundException();
    }
    return response;
  }

  async update(id: string, updateDto: UpdateTeamsizeDto): Promise<TeamSize> {
    const response = await this.teamSizeModel.findByIdAndUpdate(id, updateDto, {
      new: true,
      runValidators: true,
    });
    if (!response) {
      throw new NotFoundException();
    }
    return response;
  }

  async remove(ids: Array<string>): Promise<[]> {
    try {
      if (ids.length < 0) {
        throw new BadRequestException('Ids not found');
      }
      if (!Array.isArray(ids)) {
        throw new BadRequestException('Ids phai la mang');
      }
      if (ids.length === 1) {
        const response = await this.teamSizeModel.findById(ids[0]);
        if (!response) {
          throw new NotFoundException();
        }
        const result = await this.teamSizeModel.deleteOne({
          _id: ids[0],
        });
        if (result.deletedCount > 0) {
          return [];
        } else {
          throw new BadRequestException('Delete failed!');
        }
      } else {
        const response = await this.teamSizeModel.find({
          _id: { $in: ids },
        });
        if (!response) {
          throw new NotFoundException();
        }
        const result = await this.teamSizeModel.deleteMany({
          _id: { $in: ids },
        });
        if (result.deletedCount > 0) {
          return [];
        } else {
          throw new BadRequestException('Delete failed!');
        }
      }
    } catch (error) {
      throw new NotFoundException(error);
    }
  }
}
