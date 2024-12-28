import { CreateFavoriteJobDto } from './dto/create-favorite-job.dto';
import { UpdateFavoriteJobDto } from './dto/update-favorite-job.dto';
import { FavoriteJob } from './schema/favorite-job.schema';
import { User } from '../users/schemas/User.schema';
import { Meta } from '../types';

export interface IFavoriteJobService {
  create(createFavoriteJobDto: CreateFavoriteJobDto): Promise<FavoriteJob | []>;
  getFavoriteJobDetailByUserId(
    data: CreateFavoriteJobDto,
  ): Promise<FavoriteJob>;
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
