/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';
import { Notification } from './schema/notification.schema';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from 'src/modules/users/schemas/User.schema';
import aqp from 'api-query-params';
import {
  NotificationUpdateDto,
  UpdateReadStatusDto,
} from './dto/NotificationUpdateDto.dto';
import * as dayjs from 'dayjs';
import { Application } from 'src/modules/application/schema/Application.schema';

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
      type:'view_resume'
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
      type: 'view_resume',
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

  async notificationWhenEmployerSaveCandidate(candidate: User, employer: User) {
    const existingNotification = await this.notificationModel.findOne({
      candidateId: candidate._id,
      employerId: employer._id,
      type:'save_profile'
    });

    if (existingNotification) {
      console.log('Thông báo đã được gửi trước đó, không gửi lại');
      return;
    }
    const message = `Nhà tuyển dụng ${employer.company_name} vừa lưu hồ sơ của bạn`;
    const notification = new this.notificationModel({
      candidateId: candidate?._id,
      employerId: employer?._id,
      message,
      title: 'Lưu hồ sơ',
      type: 'save_profile',
    });
    notification.save();
    this.emailService.sendMail({
      to: candidate.email,
      subject: `Nhà tuyển dụng ${employer.company_name} vừa lưu hồ sơ của bạn`, // Chủ đề email
      text: `Xin chào ${candidate.full_name}`, // Nội dung email dạng văn bản thuần túy
      template: 'templateSaveCandidate', // Template HTML tiếng Việt để sử dụng
      context: {
        candidateName: candidate.full_name, // Tên ứng viên
        recruiterCompany: employer.company_name, // Tên nhà tuyển dụng
        recruiterEmail: employer.email, // Email của nhà tuyển dụng
      },
    });
    

    this.notificationGateway.sendNotificationToCandidate(
      candidate?._id + '',
      message,
    );
  }

  async notificationWhenChangeStatusApplication(
    candidate: User, 
    employer: User, 
    type: 'accepted' | 'rejected',
    jobTitle:string,
    appliedId:string
  ) {
    // Kiểm tra nếu thông báo đã tồn tại
    const existingNotification = await this.notificationModel.findOne({
      candidateId: candidate._id,
      employerId: employer._id,
      type: 'status_application',
      status_type_application: type,
      applicationId:appliedId
    });
  
    // Nếu thông báo đã gửi trước đó, dừng lại và không gửi lại
    if (existingNotification) {
      console.log('Thông báo đã được gửi trước đó, không gửi lại');
      return;
    }
  
    // Tạo thông báo mới với message phù hợp
    const message = `Nhà tuyển dụng ${employer.company_name} vừa ${type === 'accepted' ? 'chấp nhận' : 'từ chối'} hồ sơ của bạn`;
    const notification = new this.notificationModel({
      candidateId: candidate._id,
      employerId: employer._id,
      message,
      title: 'Thay đổi trạng thái hồ sơ',
      type: 'status_application',
      status_type_application: type,
      applicationId:appliedId || ''
    });
  
    // Lưu thông báo
    await notification.save();
  
    // Gửi email với template khác nhau tùy vào trạng thái (chấp nhận hoặc từ chối)
    const emailTemplate = type === 'accepted' ? 'acceptedApplication' : 'rejectedApplication';
    const emailSubject = `Nhà tuyển dụng ${employer.company_name} vừa ${type === 'accepted' ? 'chấp nhận' : 'từ chối'} hồ sơ của bạn`;
    console.log("jobb",jobTitle)
    await this.emailService.sendMail({
      to: candidate.email,
      subject: emailSubject, // Chủ đề email phù hợp
      text: `Xin chào ${candidate.full_name}`, // Nội dung email thuần
      template: emailTemplate, // Template HTML tùy thuộc vào trạng thái
      context: {
        candidateName: candidate.full_name, // Tên ứng viên
        recruiterCompany: employer.company_name, // Tên nhà tuyển dụng
        recruiterEmail: employer.email, // Email nhà tuyển dụng
        jobTitle:jobTitle || ''
      },
    });
  
    // Gửi thông báo đến ứng viên qua Notification Gateway
    this.notificationGateway.sendNotificationToCandidate(candidate._id + '', message);
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

  // Lấy thông báo theo tuần cho một ứng viên cụ thể
  async getNotificationsInCurrentWeek(
    query: string,
    current: number,
    pageSize: number,
  ): Promise<any> {
    const { filter, sort } = aqp(query);
    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;

    if (!current) current = 1;
    if (!pageSize) pageSize = 10;

    // Lấy thời gian hiện tại và tính toán thời gian bắt đầu và kết thúc tuần
    const now = new Date(); // Lấy thời gian hiện tại theo UTC
    const startOfWeek = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - now.getDay(),
      0,
      0,
      0,
      0,
    );
    const endOfWeek = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - now.getDay() + 6,
      23,
      59,
      59,
      999,
    );
    if(filter.candidateId){
      filter.candidateId = new Types.ObjectId(filter.candidateId);
    }
    if(filter.employerId){
      filter.employerId = new Types.ObjectId(filter.employerId);
    }
    // Truy vấn MongoDB với filter, sort, và thời gian
    const totalItems = await this.notificationModel.countDocuments({
      createdAt: { $gte: startOfWeek, $lte: endOfWeek },
      ...filter,
    });
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (+current - 1) * pageSize;

    const result = await this.notificationModel
      .find({
        createdAt: { $gte: startOfWeek, $lte: endOfWeek },
        ...filter,
      })
      .limit(pageSize)
      .skip(skip)
      .sort(sort as any)
      .exec();

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
  // Lấy thông báo theo tháng cho một ứng viên cụ thể
  async getNotificationsInCurrentMonth(
    query: string,
    current: number,
    pageSize: number,
  ): Promise<any> {
    const { filter, sort } = aqp(query);
    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;

    if (!current) current = 1;
    if (!pageSize) pageSize = 10;
    if(filter.candidateId){
      filter.candidateId = new Types.ObjectId(filter.candidateId);
    }
    if(filter.employerId){
      filter.employerId = new Types.ObjectId(filter.employerId);
    }
    // Lấy thời gian hiện tại và tính toán thời gian đầu tháng và cuối tháng
    const now = new Date(); // Lấy thời gian hiện tại theo UTC
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    startOfMonth.setHours(0, 0, 0, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    // Truy vấn MongoDB với filter, sort và thời gian
    const totalItems = await this.notificationModel.countDocuments({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      ...filter,
    });

    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (+current - 1) * pageSize;

    const result = await this.notificationModel
      .find({
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        ...filter,
      })
      .limit(pageSize)
      .skip(skip)
      .sort(sort as any)
      .exec();

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

  // Lấy thông báo theo năm cho một ứng viên cụ thể
  async getNotificationsInCurrentYear(
    query: string,
    current: number,
    pageSize: number,
  ): Promise<any> {
    const { filter, sort } = aqp(query);
    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;

    if (!current) current = 1;
    if (!pageSize) pageSize = 10;

    if(filter.candidateId){
      filter.candidateId = new Types.ObjectId(filter.candidateId);
    }
    if(filter.employerId){
      filter.employerId = new Types.ObjectId(filter.employerId);
    }
    // Lấy thời gian hiện tại và tính toán thời gian đầu năm và cuối năm
    const now = new Date(); // Lấy thời gian hiện tại theo UTC
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const endOfYear = new Date(now.getFullYear(), 11, 31);
    startOfYear.setHours(0, 0, 0, 0);
    endOfYear.setHours(23, 59, 59, 999);

    // Truy vấn MongoDB với filter, sort và thời gian
    const totalItems = await this.notificationModel.countDocuments({
      createdAt: { $gte: startOfYear, $lte: endOfYear },
      ...filter,
    });

    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (+current - 1) * pageSize;

    const result = await this.notificationModel
      .find({
        createdAt: { $gte: startOfYear, $lte: endOfYear },
        ...filter,
      })
      .limit(pageSize)
      .skip(skip)
      .sort(sort as any)
      .exec();

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
}
