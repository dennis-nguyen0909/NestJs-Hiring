import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MonthlyUsage, MonthlyUsageDocument } from './monthly-usage.schema';
import { CreateMonthlyUsageDto } from './dto/create-monthly-usage.dto';
import { UpdateMonthlyUsageDto } from './dto/update-monthly-usage.dto';

@Injectable()
export class MonthlyUsageService {
  constructor(
    @InjectModel(MonthlyUsage.name)
    private monthlyUsageModel: Model<MonthlyUsageDocument>,
  ) {}

  async create(
    createMonthlyUsageDto: CreateMonthlyUsageDto,
  ): Promise<MonthlyUsage> {
    const createdMonthlyUsage = new this.monthlyUsageModel(
      createMonthlyUsageDto,
    );
    return createdMonthlyUsage.save();
  }

  async findAll(): Promise<MonthlyUsage[]> {
    return this.monthlyUsageModel.find().exec();
  }

  async findOne(id: string): Promise<MonthlyUsage> {
    return this.monthlyUsageModel.findById(id).exec();
  }

  async update(
    id: string,
    updateMonthlyUsageDto: UpdateMonthlyUsageDto,
  ): Promise<MonthlyUsage> {
    return this.monthlyUsageModel
      .findByIdAndUpdate(id, updateMonthlyUsageDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<MonthlyUsage> {
    return this.monthlyUsageModel.findByIdAndDelete(id).exec();
  }

  async findByUserIdAndMonth(
    userId: string,
    yearMonth: string,
  ): Promise<MonthlyUsage> {
    return this.monthlyUsageModel.findOne({ userId, yearMonth }).exec();
  }

  async incrementUsage(
    userId: string,
    yearMonth: string,
    field: keyof MonthlyUsage,
    increment: number = 1,
  ): Promise<MonthlyUsage> {
    return this.monthlyUsageModel
      .findOneAndUpdate(
        { userId, yearMonth },
        { $inc: { [field]: increment } },
        { new: true, upsert: true },
      )
      .exec();
  }

  async resetMonthlyUsage(
    userId: string,
    yearMonth: string,
  ): Promise<MonthlyUsage> {
    const resetDate = new Date();
    return this.monthlyUsageModel
      .findOneAndUpdate(
        { userId, yearMonth },
        {
          $set: {
            jobsPosted: 0,
            resumesViewed: 0,
            featuredJobsUsed: 0,
            jobRefreshesUsed: 0,
            directContactsUsed: 0,
            resetDate,
          },
        },
        { new: true, upsert: true },
      )
      .exec();
  }
}
