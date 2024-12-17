import { Injectable } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';
import { Notification } from './schema/notification.schema';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from 'src/modules/users/schemas/User.schema';
import aqp from 'api-query-params';
import { NotificationUpdateDto, UpdateReadStatusDto } from './dto/NotificationUpdateDto.dto';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,
    private readonly notificationGateway: NotificationGateway,
    private emailService: MailerService,
  ) {}

  async notifyCandidateAboutProfileView(candidate: User, employer: User) {
    // Kiểm tra xem nhà tuyển dụng đã xem hồ sơ của ứng viên này chưa
    const existingNotification = await this.notificationModel.findOne({
      candidateId: candidate._id,
      employerId: employer._id,
    });

    if (existingNotification) {
      console.log('Thông báo đã được gửi trước đó, không gửi lại');
      return;
    }
    const message = `Nhà tuyển dụng ${employer.company_name} vừa xem hồ sơ của bạn`;
    const notification = new this.notificationModel({
      candidateId: candidate?._id,
      employerId: employer?._id,
      message,
      title: 'Xem hồ sơ',
    });
    notification.save();
    this.emailService.sendMail({
      to: candidate.email,
      subject: `Job Application from HireDev`, // Chủ đề email, bao gồm tên công ty nhà tuyển dụng
      text: `Dear ${candidate.full_name}, thank you for applying!`, // Nội dung email dạng văn bản thuần túy
      template: 'notificationViewCandidate', // Template HTML để sử dụng
      context: {
        candidateName: candidate.full_name, // Tên ứng viên
        employerName: employer?.company_name, // Tên nhà tuyển dụng
        employerAvatar: employer?.avatar_company, // Avatar của nhà tuyển dụng
        companyName: employer?.company_name, // Tên công ty của nhà tuyển dụng
      },
    });

    this.notificationGateway.sendNotificationToCandidate(
      candidate?._id + '',
      message,
    );
  }

  async getAll(query: string, current: number, pageSize: number) {
    try {
      const { filter, sort } = aqp(query);
      if (filter.current) delete filter.current;
      if (filter.pageSize) delete filter.pageSize;
      if (!current) current = 1;
      if (!pageSize) pageSize = 15;
      const totalItems = await this.notificationModel
        .find(filter)
        .countDocuments();
      const totalPages = Math.ceil(totalItems / pageSize);
      const skip = (+current - 1) * pageSize;
      const result = await this.notificationModel
        .find(filter)
        .limit(pageSize)
        .skip(skip)
        .sort({ ...(sort as any), createdAt: -1 });
      return {
        items: result,
        meta: {
          count: result.length,
          current_page: +current,
          per_page: +pageSize,
          total: totalItems,
          total_pages: totalPages,
        },
      };
    } catch (error) {
      throw new Error(error);
    }
  }

  async getNotificationsForEmployer(
    employerId: string,
    query: string,
    current: number,
    pageSize: number,
  ) {
    try {
      const { filter, sort } = aqp(query);

      // Xóa các field không cần thiết
      if (filter.current) delete filter.current;
      if (filter.pageSize) delete filter.pageSize;

      // Gán giá trị mặc định cho phân trang
      if (!current) current = 1;
      if (!pageSize) pageSize = 15;

      // Thêm điều kiện lọc theo employerId
      filter.employerId = new Types.ObjectId(employerId);

      // Lấy tổng số thông báo
      const totalItems = await this.notificationModel
        .find(filter)
        .countDocuments();
      const totalPages = Math.ceil(totalItems / pageSize);
      const skip = (+current - 1) * pageSize;

      // Lấy danh sách thông báo theo employerId
      const result = await this.notificationModel
        .find(filter)
        .limit(pageSize)
        .skip(skip)
        .sort({ ...(sort as any), createdAt: -1 });

      return {
        items: result,
        meta: {
          count: result.length,
          current_page: +current,
          per_page: +pageSize,
          total: totalItems,
          total_pages: totalPages,
        },
      };
    } catch (error) {
      throw new Error(error);
    }
  }

  async getNotificationsForCandidate(
    candidateId: string,
    query: string,
    current: number,
    pageSize: number,
  ) {
    try {
      const { filter, sort } = aqp(query);

      // Xóa các field không cần thiết
      if (filter.current) delete filter.current;
      if (filter.pageSize) delete filter.pageSize;

      // Gán giá trị mặc định cho phân trang
      if (!current) current = 1;
      if (!pageSize) pageSize = 15;

      // Thêm điều kiện lọc theo candidateId
      filter.candidateId = new Types.ObjectId(candidateId);
      // Lấy tổng số thông báo
      const totalItems = await this.notificationModel
        .find(filter)
        .countDocuments();
      const totalPages = Math.ceil(totalItems / pageSize);
      const skip = (+current - 1) * pageSize;

      // Lấy danh sách thông báo theo candidateId
      const result = await this.notificationModel
        .find(filter)
        .limit(pageSize)
        .skip(skip)
        .sort({ ...(sort as any), createdAt: -1 });

      return {
        items: result,
        meta: {
          count: result.length,
          current_page: +current,
          per_page: +pageSize,
          total: totalItems,
          total_pages: totalPages,
        },
      };
    } catch (error) {
      throw new Error(error);
    }
  }

  async update(id: string, data: NotificationUpdateDto) {
    try {
      // Kiểm tra xem id có phải là ObjectId hợp lệ không
      if (!Types.ObjectId.isValid(id)) {
        throw new Error('Invalid notification ID');
      }

      // Tìm và cập nhật thông báo với dữ liệu mới
      const updatedNotification =
        await this.notificationModel.findByIdAndUpdate(
          id,
          { $set: data }, // Cập nhật với dữ liệu từ DTO
          { new: true }, // Trả về document sau khi update
        );

      // Kiểm tra xem thông báo có tồn tại không
      if (!updatedNotification) {
        throw new Error('Notification not found');
      }

      // Trả về thông báo đã được cập nhật
      return updatedNotification;
    } catch (error) {
      // Ném lỗi để xử lý ở tầng trên
      throw new Error(error.message || 'Error updating notification');
    }
  }

  async updateReadStatus(
    updateReadStatusDto: UpdateReadStatusDto,
  ): Promise<any> {
    const { notification_ids } = updateReadStatusDto;

    // Cập nhật các thông báo đã được đọc
    const result = await this.notificationModel.updateMany(
      { _id: { $in: notification_ids } },
      { $set: { isRead: true } },
    );

    return result;
  }
}
