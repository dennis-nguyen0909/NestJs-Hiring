import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateFavoriteJobDto } from './dto/create-favorite-job.dto';
import { UpdateFavoriteJobDto } from './dto/update-favorite-job.dto';
import { InjectModel } from '@nestjs/mongoose';
import { FavoriteJob } from './schema/favorite-job.schema';
import { Model } from 'mongoose';
import { User } from '../users/schemas/User.schema';
import aqp from 'api-query-params';
import { IFavoriteJobService } from './favorite-job.interface';
import { Meta } from '../types';

@Injectable()
export class FavoriteJobService implements IFavoriteJobService {
  constructor(
    @InjectModel(FavoriteJob.name) private favoriteJobModel: Model<FavoriteJob>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}
  async create(
    createFavoriteJobDto: CreateFavoriteJobDto,
  ): Promise<FavoriteJob | []> {
    try {
      const favorite = await this.favoriteJobModel.findOne({
        job_id: createFavoriteJobDto.job_id,
      });
      const user = await this.userModel.findById(createFavoriteJobDto.user_id);
      if (favorite) {
        await this.userModel.updateOne(
          {
            _id: createFavoriteJobDto.user_id,
          },
          {
            $pull: { favorite_jobs: favorite._id },
          },
        );
        await this.favoriteJobModel.deleteOne({
          _id: favorite._id,
        });
        return [];
      } else {
        const create = await this.favoriteJobModel.create(createFavoriteJobDto);
        user.favorite_jobs.push(create._id);
        await user.save();
        return create;
      }
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async getFavoriteJobDetailByUserId(
    data: CreateFavoriteJobDto,
  ): Promise<FavoriteJob> {
    try {
      const res = await this.favoriteJobModel.findOne({
        user_id: data.user_id,
        job_id: data.job_id,
      });
      if (!res) {
        throw new NotFoundException('Not found');
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
  ): Promise<{ items: FavoriteJob[]; meta: Meta }> {
    const { filter, sort } = aqp(query);
    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;
    if (!current) current = 1;
    if (!pageSize) pageSize = 10;

    const totalItems = (await this.favoriteJobModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (+current - 1) * pageSize;
    const result = await this.favoriteJobModel
      .find(filter)
      .limit(pageSize)
      .skip(skip)
      .sort(sort as any)
      .populate({
        path: 'job_id',
        populate: [
          {
            path: 'user_id', // Then populate user_id within job_id
            select: '-password -createdAt -updatedAt -code_id -code_expired', // Exclude specific fields
          },
          {
            path: 'city_id', // Populate city_id within job_id
            select: 'name', // Select only the 'name' field
          },
          {
            path: 'district_id', // Populate district_id within job_id
            select: 'name', // Select only the 'name' field
          },
          {
            path: 'ward_id', // Populate ward_id within job_id
            select: 'name', // Select only the 'name' field
          },
        ],
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
  }

  async findOne(id: number): Promise<FavoriteJob> {
    return await this.favoriteJobModel.findOne({ _id: id });
  }

  async update(
    id: string,
    updateFavoriteJobDto: UpdateFavoriteJobDto,
  ): Promise<FavoriteJob> {
    try {
      // Use findByIdAndUpdate to update the document and return the updated version
      const updatedFavoriteJob = await this.favoriteJobModel.findByIdAndUpdate(
        id,
        updateFavoriteJobDto,
        { new: true }, // Ensures the updated document is returned
      );

      if (!updatedFavoriteJob) {
        throw new NotFoundException('Favorite job not found');
      }

      return updatedFavoriteJob;
    } catch (error) {
      throw new BadRequestException(
        'An error occurred while updating the favorite job',
      );
    }
  }

  async remove(id: string): Promise<[]> {
    try {
      const favoriteJob = await this.favoriteJobModel.findById(id);

      if (!favoriteJob) {
        throw new NotFoundException('Favorite job not found');
      }

      // Remove the favorite job
      await this.favoriteJobModel.deleteOne({ _id: id });

      return [];
    } catch (error) {
      throw new BadRequestException(
        'An error occurred while removing the favorite job',
      );
    }
  }
}
