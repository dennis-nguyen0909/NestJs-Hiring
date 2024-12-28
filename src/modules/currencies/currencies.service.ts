import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import aqp from 'api-query-params';
import { Currency } from './schema/currencies.schema';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';
import { ICurrenciesService } from './currentcies.interface';
import { Meta } from '../types';

@Injectable()
export class CurrenciesService implements ICurrenciesService {
  constructor(
    @InjectModel(Currency.name)
    private readonly currencyModel: Model<Currency>,
  ) {}
  async create(data: CreateCurrencyDto): Promise<Currency> {
    const response = await this.currencyModel.create(data);
    if (!response) {
      throw new BadRequestException('Failed');
    }
    return response;
  }

  async findAll(
    query: string,
    current: number,
    pageSize: number,
  ): Promise<{ items: Currency[]; meta: Meta }> {
    const { filter, sort } = aqp(query);
    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;
    if (!current) current = 1;
    if (!pageSize) pageSize = 10;
    const totalItems = (await this.currencyModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (+current - 1) * pageSize;
    const result = await this.currencyModel
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

  async findOne(id: string): Promise<Currency> {
    const job = await this.currencyModel.findOne({ _id: id });
    if (!job) {
      throw new NotFoundException();
    }
    return job;
  }

  async update(
    id: string,
    updateLevelDto: UpdateCurrencyDto,
  ): Promise<Currency> {
    const job = await this.currencyModel.findByIdAndUpdate(id, updateLevelDto, {
      new: true,
      runValidators: true,
    });
    if (!job) {
      throw new NotFoundException();
    }
    return job;
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
        const job = await this.currencyModel.findById(ids[0]);
        if (!job) {
          throw new NotFoundException();
        }
        const result = await this.currencyModel.deleteOne({ _id: ids[0] });
        if (result.deletedCount > 0) {
          return [];
        } else {
          throw new BadRequestException('Delete failed!');
        }
      } else {
        const jobs = await this.currencyModel.find({ _id: { $in: ids } });
        if (!jobs) {
          throw new NotFoundException();
        }
        const result = await this.currencyModel.deleteMany({
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
