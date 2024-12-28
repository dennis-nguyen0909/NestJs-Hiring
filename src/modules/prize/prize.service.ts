/* eslint-disable prettier/prettier */
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from '../users/schemas/User.schema';
import { Prize } from './schema/prize.schema';
import { CreatePrizeDto } from './dto/create-prize.dto';
import { UpdatePrizeDto } from './dto/update-prize.dto';
import { Meta } from '../types';
import aqp from 'api-query-params';
import { IPrizeService } from './prize.interface';

@Injectable()
export class PrizeService implements IPrizeService {
  constructor(
    @InjectModel(Prize.name)
    private prizeModel: Model<Prize>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async create(createPrizeDto:CreatePrizeDto):Promise<Prize> {
    const newPrize =
    await this.prizeModel.create(createPrizeDto);
  if (!newPrize) {
    throw new BadRequestException('Create prize failed');
  }
  const user = await this.userModel.findById(
    newPrize.user_id,
  );
  if (!user) {
    throw new NotFoundException(
      `user #${newPrize.user_id} not found`,
    );
  }
  const prizeId = new Types.ObjectId(newPrize._id+"");
  user.prizes.push(prizeId);
  await user.save();
  return newPrize;
    }
  

    async findAll(
      query: string,
      current: number,
      pageSize: number,
    ): Promise<{ items: Prize[]; meta: Meta }> {
     const { filter, sort } = aqp(query);
      if (filter.current) delete filter.current;
      if (filter.pageSize) delete filter.pageSize;
  
      if (!current) current = 1;
      if (!pageSize) pageSize = 10;
      const totalItems = (await this.prizeModel.find(filter)).length;
      const totalPages = Math.ceil(totalItems / pageSize);
      const skip = (+current - 1) * pageSize;
      const result = await this.prizeModel
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

  async findOne(id: string):Promise<Prize> {
    const prize = await this.prizeModel.findById(id).exec();
    if (!prize) {
      throw new NotFoundException(`prize with ID ${id} not found`);
    }
    return prize;
  }

  async update(id: string, updatePrizeDto: UpdatePrizeDto):Promise<Prize> {
    const updatePrizes = await this.prizeModel.findByIdAndUpdate(
      id,
      updatePrizeDto,
      { new: true },
    );
    if (!updatePrizes) {
      throw new NotFoundException(`Certificate #${id} not found`);
    }
    return updatePrizes;
  }

  async remove(id: string, userId: string):Promise<void> {
    const prize = await this.prizeModel.findById(id).exec();
    if (!prize) {
      throw new NotFoundException(`Prize #${id} not found`);
    }
    if (prize?.user_id === new Types.ObjectId(userId)) {
      throw new ForbiddenException(
        'You are not allowed to delete this prize',
      );
    }

    const result = await this.prizeModel.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      throw new BadRequestException(
        'Prize not found or could not be deleted',
      );
    }
    
    await this.userModel.updateOne(
      { _id: prize.user_id },
      { $pull: { prizes: id } }, 
    );
  }

  async findByOwner(ownerId: string):Promise<Prize[]> {
    return this.prizeModel
      .find({ owner: ownerId })
      .populate('owner')
      .exec();
  }
}
