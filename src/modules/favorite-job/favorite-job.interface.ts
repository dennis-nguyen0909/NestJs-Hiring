import { CreateFavoriteJobDto } from './dto/create-favorite-job.dto';
import { UpdateFavoriteJobDto } from './dto/update-favorite-job.dto';
import { FavoriteJob } from './schema/favorite-job.schema';
import { Meta } from '../types';
import { Request } from 'express';

export interface IFavoriteJobService {
  create(
    createFavoriteJobDto: CreateFavoriteJobDto,
    req: Request,
  ): Promise<FavoriteJob | []>;
  getFavoriteJobDetailByUserId(data: {
    user_id: string;
    job_id: string;
  }): Promise<FavoriteJob>;
  findAll(
    query: string,
    current: number,
    pageSize: number,
  ): Promise<{ items: FavoriteJob[]; meta: Meta }>;
  findOne(id: number): Promise<FavoriteJob>;
  update(
    id: string,
    updateFavoriteJobDto: UpdateFavoriteJobDto,
  ): Promise<FavoriteJob>;
  remove(id: string): Promise<[]>;
}
