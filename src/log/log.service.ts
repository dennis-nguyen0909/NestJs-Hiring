import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateLogDto } from './dto/create-log.dto';
import { UpdateLogDto } from './dto/update-log.dto';
import { logConnection } from 'src/db/conection';
import { Log, LogDocument } from './schema/log.schema';
import aqp from 'api-query-params';
import { Meta } from 'src/modules/types';

@Injectable()
export class LogService {
  constructor(@InjectModel(Log.name) private logModel: Model<LogDocument>) {}

  // Ghi log tạo mới
  async createLog(createLogDto: CreateLogDto): Promise<Log> {
    const createdLog = new this.logModel(createLogDto);
    return createdLog.save();
  }

  // Ghi log cập nhật
  async updateLog(id: string, updateLogDto: UpdateLogDto): Promise<Log> {
    const updatedLog = await this.logModel.findByIdAndUpdate(id, updateLogDto, {
      new: true,
    });
    if (!updatedLog) {
      throw new NotFoundException(`Log with ID ${id} not found`);
    }
    return updatedLog;
  }

  // Ghi log xóa
  async deleteLog(id: string): Promise<Log> {
    const deletedLog = await this.logModel.findByIdAndDelete(id);
    if (!deletedLog) {
      throw new NotFoundException(`Log with ID ${id} not found`);
    }
    return deletedLog;
  }

  // Tìm kiếm log
  async searchLogs(query: any): Promise<Log[]> {
    return this.logModel.find(query).exec();
  }

  // Ghi log bật/tắt thông báo
  async toggleNotificationLog(userId: string, status: string): Promise<Log> {
    const log = new this.logModel({
      userId,
      action: 'TOGGLE_NOTIFICATION',
      description: `User ${userId} turned ${status} notifications`,
      entityCollection: 'notifications',
      entityId: userId,
    });
    return log.save();
  }

  async getUserActivity(
    current: number,
    pageSize: number,
    query: string,
  ): Promise<{ items: Log[]; meta: Meta }> {
    const { filter, sort } = aqp(query);
    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;
    if (!current) current = 1;
    if (!pageSize) pageSize = 10;
    if (filter?.userId) {
      filter.userId = new Types.ObjectId(filter.userId);
      delete filter.userId;
    }
    const skip = (current - 1) * pageSize;
    const total = await this.logModel.countDocuments(filter);
    const sortDefault = { createdAt: -1 };
    const result = await this.logModel
      .find(filter)
      .skip(skip)
      .limit(pageSize)
      .sort(sortDefault as any)
      .populate('userId', 'full_name email')
      .populate({
        path: 'changes.new.city_id', // Populating the 'new' value's city_id
        select: 'name codename',
      })
      .populate({
        path: 'changes.new.district_id', // Populating the 'new' value's district_id
        select: 'name codename',
      })
      .populate({
        path: 'changes.new.ward_id', // Populating the 'new' value's ward_id
        select: 'name codename',
      })
      .exec();
    return {
      items: result,
      meta: {
        count: result.length,
        current_page: current,
        per_page: pageSize,
        total: total,
        total_pages: Math.ceil(total / pageSize),
      },
    };
  }
}
