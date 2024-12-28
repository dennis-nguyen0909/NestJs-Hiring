import { CreatePrizeDto } from './dto/create-prize.dto';
import { UpdatePrizeDto } from './dto/update-prize.dto';
import { Prize } from './schema/prize.schema';
import { Meta } from '../types';

export interface IPrizeService {
  create(createPrizeDto: CreatePrizeDto): Promise<Prize>;

  findAll(
    query: string,
    current: number,
    pageSize: number,
  ): Promise<{ items: Prize[]; meta: Meta }>;

  findOne(id: string): Promise<Prize>;

  update(id: string, updatePrizeDto: UpdatePrizeDto): Promise<Prize>;

  remove(id: string, userId: string): Promise<void>;

  findByOwner(ownerId: string): Promise<Prize[]>;
}
