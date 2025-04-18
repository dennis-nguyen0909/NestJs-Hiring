import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateEducationDto } from './dto/create-education.dto';
import { UpdateEducationDto } from './dto/update-education.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Education } from './schema/Education.schema';
import { Model, Types } from 'mongoose';
import aqp from 'api-query-params';
import { create } from 'domain';
import { User } from '../users/schemas/user.schema';
import { UsersService } from '../users/users.service';
import { Meta } from '../types';
import { Request } from 'express';
import { LogService } from 'src/log/log.service';

@Injectable()
export class EducationService {
  constructor(
    @InjectModel(Education.name)
    private readonly educationModel: Model<Education>,
    private readonly userService: UsersService,
    private readonly logService: LogService,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}
  async addEducation(
    createEducationDto: CreateEducationDto,
    req: Request,
  ): Promise<Education> {
    const session = await this.educationModel.startSession();
    session.startTransaction();
    try {
      console.log('start_date', createEducationDto.start_date);
      console.log('end_date', createEducationDto.end_date);
      // Kiểm tra xem người dùng đã có trường học này chưa
      const existingEducation = await this.educationModel.findOne({
        user_id: createEducationDto.user_id,
        school: createEducationDto.school,
      });

      if (existingEducation) {
        throw new BadRequestException('Bạn đã thêm trường học này rồi!');
      }

      // Tạo mới bản ghi Education
      const education = await this.educationModel.create(createEducationDto);

      // Cập nhật thông tin người dùng, thêm ObjectId của bản ghi Education vào mảng education_ids
      const user = await this.userModel.findOneAndUpdate(
        { _id: createEducationDto.user_id },
        { $push: { education_ids: education._id } }, // Thêm ObjectId của Education vào mảng education_ids của User
        { new: true, session }, // Trả về tài liệu người dùng đã được cập nhật
      );

      // Kiểm tra xem người dùng có tồn tại không
      if (!user) {
        throw new BadRequestException('Không tìm thấy người dùng');
      }

      await this.logService.createLog({
        userId: new Types.ObjectId(user?._id + ''),
        userRole: 'CANDIDATE',
        action: 'CREATE',
        entityId: education._id.toString(),
        entityCollection: 'education',
        entityName: education?.school,
        activityDetail: 'user_create_education',
        changeColumns: {
          school: { value: education?.school },
          major: { value: education?.major },
          degree: { value: education?.degree },
          start_date: { value: education?.start_date },
          end_date: { value: education?.end_date },
          description: { value: education?.description },
          currently_studying: { value: education?.currently_studying },
        },
        req: req,
      });
      // Trả về thông tin của Education đã được tạo mới
      await session.commitTransaction();
      return education;
    } catch (error) {
      // Abort transaction nếu có lỗi
      await session.abortTransaction();
      throw new BadRequestException(error.message);
    } finally {
      // Đảm bảo session được kết thúc đúng cách
      await session.endSession();
    }
  }

  // Lấy danh sách Education dựa trên userId
  async findEducationsByUserId(userId: string): Promise<Education[]> {
    return this.educationModel.find({ user_id: userId }).exec();
  }

  async findAll(
    query: string,
    current: number,
    pageSize: number,
  ): Promise<{ items: Education[]; meta: Meta }> {
    const { filter, sort } = aqp(query);
    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;
    if (!current) current = 1;
    if (!pageSize) pageSize = 10;
    const totalItems = (await this.educationModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (+current - 1) * pageSize;
    const result = await this.educationModel
      .find(filter)
      .limit(pageSize)
      .skip(skip)
      .sort({ createdAt: -1, ...sort });
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

  async findOne(id: string): Promise<Education> {
    const education = await this.educationModel.findById({ _id: id });
    if (!education) {
      throw new BadRequestException('Không tìm thấy dữ liệu');
    }
    return education;
  }

  async updateByUserId(
    id: string,
    updateEducationDto: UpdateEducationDto,
    userId: string,
    req: Request,
  ): Promise<Education> {
    const session = await this.educationModel.startSession(); // Khởi tạo session
    session.startTransaction(); // Bắt đầu transaction

    try {
      // Tìm kiếm bản ghi Education để xác minh quyền cập nhật
      const education = await this.educationModel
        .findById({ _id: id })
        .session(session); // Truyền session vào truy vấn

      if (!education) {
        throw new BadRequestException('Không tìm thấy bản ghi Education');
      }

      // Kiểm tra quyền cập nhật
      if (education.user_id + '' !== userId) {
        throw new BadRequestException('Không có quyền cập nhật');
      }

      // Cập nhật bản ghi Education
      const updatedEducation = await this.educationModel.findByIdAndUpdate(
        id,
        updateEducationDto,
        {
          new: true,
          runValidators: true,
          session, // Truyền session vào trong các tùy chọn
        },
      );
      const changes = {};

      for (const key in updateEducationDto) {
        if (key !== '_id' && key !== 'id' && key !== 'user_id') {
          if (education[key] !== updateEducationDto[key]) {
            changes[key] = {
              old: education[key],
              new: updateEducationDto[key],
            };
          }
        }
      }
      if (Object.keys(changes).length > 0) {
        await this.logService.createLog({
          userId: new Types.ObjectId(userId),
          userRole: 'CANDIDATE',
          action: 'UPDATE',
          entityId: id,
          entityCollection: 'education',
          changes,
          activityDetail: 'user_update_education',
          description: 'User update education',
          entityName: updateEducationDto?.school,
          req: req,
        });
      }

      // Commit transaction
      await session.commitTransaction();

      return updatedEducation;
    } catch (error) {
      // Abort transaction nếu có lỗi
      await session.abortTransaction();
      throw new BadRequestException(error.message);
    } finally {
      // Kết thúc session
      await session.endSession();
    }
  }

  async deleteByUserId(id: string, userId: string, req: Request): Promise<[]> {
    const session = await this.educationModel.startSession();
    session.startTransaction();

    try {
      // Tìm bản ghi Education để kiểm tra
      const education = await this.educationModel
        .findById({ _id: id })
        .session(session);

      if (!education) {
        throw new BadRequestException('Không tìm thấy dữ liệu');
      }

      // Kiểm tra quyền người dùng
      if (education.user_id.toString() !== userId) {
        throw new BadRequestException('Không có quyền xóa');
      }

      // Xóa Education trong bảng Education
      const res = await this.educationModel
        .deleteOne({ _id: id })
        .session(session);

      if (res.deletedCount === 0) {
        throw new BadRequestException('Xóa không thành công');
      }

      // Xóa ObjectId khỏi mảng education_ids trong bảng User
      await this.userModel
        .updateOne(
          { _id: userId },
          { $pull: { education_ids: new Types.ObjectId(id) } }, // $pull để xóa ObjectId khỏi mảng
        )
        .session(session);
      await this.logService.createLog({
        userId: new Types.ObjectId(userId),
        userRole: 'CANDIDATE',
        action: 'DELETE',
        entityId: id,
        entityCollection: 'education',
        entityName: education?.school,
        activityDetail: 'user_delete_education',
        description: 'User delete education',
        req: req,
      });
      // Commit transaction nếu tất cả đều thành công
      await session.commitTransaction();
      return [];
    } catch (error) {
      // Rollback transaction nếu có lỗi
      await session.abortTransaction();
      throw new BadRequestException(error.message);
    } finally {
      // Kết thúc session
      session.endSession();
    }
  }
}
