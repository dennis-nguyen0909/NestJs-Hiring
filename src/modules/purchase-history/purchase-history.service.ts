import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  PurchaseHistory,
  PurchaseHistoryDocument,
} from './purchase-history.schema';
import { CreatePurchaseHistoryDto } from './dto/create-purchase-history.dto';
import { UpdatePurchaseHistoryDto } from './dto/update-purchase-history.dto';

@Injectable()
export class PurchaseHistoryService {
  constructor(
    @InjectModel(PurchaseHistory.name)
    private purchaseHistoryModel: Model<PurchaseHistoryDocument>,
  ) {}

  async create(
    createPurchaseHistoryDto: CreatePurchaseHistoryDto,
  ): Promise<PurchaseHistory> {
    const createdPurchaseHistory = new this.purchaseHistoryModel(
      createPurchaseHistoryDto,
    );
    return createdPurchaseHistory.save();
  }

  async findAll(): Promise<PurchaseHistory[]> {
    return this.purchaseHistoryModel.find().exec();
  }

  async findOne(id: string): Promise<PurchaseHistory> {
    return this.purchaseHistoryModel.findById(id).exec();
  }

  async update(
    id: string,
    updatePurchaseHistoryDto: UpdatePurchaseHistoryDto,
  ): Promise<PurchaseHistory> {
    return this.purchaseHistoryModel
      .findByIdAndUpdate(id, updatePurchaseHistoryDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<PurchaseHistory> {
    return this.purchaseHistoryModel.findByIdAndDelete(id).exec();
  }

  async findByUserId(userId: string): Promise<PurchaseHistory[]> {
    return this.purchaseHistoryModel.find({ userId }).exec();
  }

  async findActivePurchases(userId: string): Promise<PurchaseHistory[]> {
    const now = new Date();
    return this.purchaseHistoryModel
      .find({
        userId,
        startDate: { $lte: now },
        endDate: { $gte: now },
        paymentStatus: 'completed',
      })
      .exec();
  }
}
