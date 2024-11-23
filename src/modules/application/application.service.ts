import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { Model, Types } from 'mongoose';
import { Application } from './schema/Application.schema';
import { InjectModel } from '@nestjs/mongoose';
import aqp from 'api-query-params';
import { DeleteApplicationDto } from './dto/delete-application.dto';
import { App } from 'supertest/types';
import { SaveCandidate } from '../save_candidates/schema/SaveCandidates.schema';
import { Job } from '../job/schema/Job.schema';

@Injectable()
export class ApplicationService {
  constructor(
    @InjectModel('Application')
    private applicationRepository: Model<Application>,
    @InjectModel('SaveCandidate')
    private saveCandidateModel: Model<SaveCandidate>,
    @InjectModel('Job') private jobModel: Model<Job>,
  ) {}

  async create(createApplicationDto: CreateApplicationDto) {
    try {
      // Kiểm tra xem Job có tồn tại, còn hạn và đang hoạt động không
      const job = await this.jobModel.findOne({
        _id: createApplicationDto.job_id,
        is_active: true,
        expire_date: { $gt: new Date() }, // Kiểm tra expired_date > ngày hiện tại
      });

      if (!job) {
        throw new BadRequestException('Job is either inactive or expired');
      }

      // Kiểm tra xem user đã ứng tuyển hay chưa
      const findUser = await this.applicationRepository.findOne({
        user_id: createApplicationDto.user_id,
        job_id: createApplicationDto.job_id, // Đảm bảo kiểm tra theo job_id
      });
      if (findUser) {
        throw new BadRequestException('User already applied');
      }

      // Tạo mới Application
      const newApplied = await this.applicationRepository.create({
        ...createApplicationDto,
      });

      if (newApplied) {
        // Cập nhật Job với user_id vào candidate_ids
        await this.jobModel.updateOne(
          { _id: newApplied.job_id }, // Điều kiện để tìm Job
          { $push: { candidate_ids: newApplied?.user_id } }, // Sử dụng $push để thêm userId vào candidate_ids
        );
        return newApplied;
      } else {
        throw new NotFoundException('Failed to apply for job');
      }
    } catch (error) {
      throw new NotFoundException(error);
    }
  }

  async findAll(query: string, current: number, pageSize: number) {
    const { filter, sort } = aqp(query);
    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;
    if (!current) current = 1;
    if (!pageSize) pageSize = 10;
    const totalItems = (await this.applicationRepository.find(filter)).length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (+current - 1) * pageSize;
    const result = await this.applicationRepository
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

  async findOne(id: string) {
    try {
      const applied = await this.applicationRepository.findById(id);
      if (applied) {
        return applied;
      } else {
        throw new NotFoundException();
      }
    } catch (error) {
      throw new NotFoundException(error);
    }
  }

  async update(id: string, updateApplicationDto: UpdateApplicationDto) {
    try {
      const applied = await this.applicationRepository.findByIdAndUpdate(
        id,
        updateApplicationDto,
        {
          new: true,
        },
      );
      if (applied) {
        return applied;
      }
    } catch (error) {
      throw new NotFoundException(error);
    }
  }

  async toggleSaveCandidate(
    applicationId: string,
    userId: string,
  ): Promise<Application> {
    const application =
      await this.applicationRepository.findById(applicationId);
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    const userIdObject = new Types.ObjectId(userId);
    if (application.save_candidates.includes(userIdObject)) {
      application.save_candidates.splice(
        application.save_candidates.indexOf(userIdObject),
        1,
      );
      // xóa bảng save-candidate
      await this.saveCandidateModel.deleteOne({
        employer: application.employer_id,
        candidate: userIdObject,
      });
    } else {
      application.save_candidates.push(userIdObject);
      // thêm vào bảng save-candidate
      await this.saveCandidateModel.create({
        employer: application.employer_id,
        candidate: userIdObject,
        isActive: true,
      });
    }

    return application.save(); // Lưu lại thay đổi vào database
  }

  async remove(data: DeleteApplicationDto) {
    const { ids } = data;
    if (!Array.isArray(ids)) {
      throw new BadRequestException('Ids not is array');
    }
    if (ids.length < 0) {
      throw new BadRequestException('Ids not found');
    }
    if (ids.length === 1) {
      try {
        const deleted = await this.applicationRepository.deleteOne({
          _id: ids[0],
        });
        if (deleted.deletedCount > 0) {
          return [];
        } else {
          throw new NotFoundException();
        }
      } catch (error) {
        throw new NotFoundException(error);
      }
    } else {
      try {
        const deleted = await this.applicationRepository.deleteMany({
          _id: { $in: ids },
        });
        if (deleted.deletedCount > 0) {
          return [];
        } else {
          throw new NotFoundException();
        }
      } catch (error) {
        throw new NotFoundException(error);
      }
    }
  }
  async getApplicationByJobId(
    jobId: string,
    query: string,
    current: number,
    pageSize: number,
  ) {
    const { filter, sort } = aqp(query);

    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;

    if (!current) current = 1;
    if (!pageSize) pageSize = 10;

    const skip = (current - 1) * pageSize;
    const limit = pageSize;
    const totalItems = await this.applicationRepository.countDocuments({
      job_id: jobId,
      ...filter,
    });

    const result = await this.applicationRepository
      .find({ job_id: jobId, ...filter })
      .skip(skip)
      .limit(limit)
      .sort(sort as any)
      .populate('job_id')
      // .populate('save_candidates')
      .populate({
        path: 'employer_id',
        select: '_id name full_name phone address role',
      })
      .populate({
        path: 'user_id',
        select:
          '_id name email full_name phone address role education_ids avatar total_experience_years total_experience_months no_experience',
        populate: [
          {
            path: 'education_ids',
            select: 'school major start_date currently_studying',
          },
          {
            path: 'work_experience_ids',
          },
        ],
      });

    const totalPages = Math.ceil(totalItems / pageSize);

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
  async cancelApplication(applicationId: string, userId: string) {
    try {
      const application = await this.applicationRepository.findOne({
        _id: applicationId,
        user_id: userId,
      });

      if (!application) {
        throw new NotFoundException('Application not found');
      }

      // Xóa bản ghi ứng tuyển
      await this.applicationRepository.deleteOne({ _id: applicationId });

      // Xóa user_id khỏi mảng candidate_ids trong Job
      await this.jobModel.updateOne(
        { _id: application.job_id },
        { $pull: { candidate_ids: userId } }, // Xóa user_id khỏi danh sách candidate_ids
      );

      return { message: 'Application cancelled successfully' };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getAppliedUserId(userId: string) {
    try {
      console.log(userId);

      // Sử dụng countDocuments để đếm số lượng ứng tuyển của user_id
      const count = await this.applicationRepository.countDocuments({
        user_id: userId,
      });
      if (count === 0) {
        throw new NotFoundException('No applications found for this user!');
      }

      return count;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getRecentlyApplied(candidateId: string, limit: number) {
    try {
      const res = await this.applicationRepository
        .find({ user_id: candidateId })
        .populate('job_id') // Populate job details
        .populate(
          'employer_id',
          '-password -role -account_type -code_id -code_expired -auth_providers',
        ) // Populate employer details
        .sort({ applied_date: -1 }) // Sort by applied_date (descending)
        .limit(limit)
        .exec();
      if (!res) {
        throw new NotFoundException('Not found!');
      }
      return res;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getRecentlyAppliedCandidate(
    query: string,
    current: number,
    pageSize: number,
  ) {
    const { filter, sort } = aqp(query);
    console.log('filter', filter);
    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;
    if (!current) current = 1;
    if (!pageSize) pageSize = 10;
    const totalItems = (await this.applicationRepository.find(filter)).length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (+current - 1) * pageSize;
    const result = await this.applicationRepository
      .find(filter)
      .limit(pageSize)
      .skip(skip)
      .sort({ ...(sort as any), applied_date: -1 })
      .populate(
        'employer_id',
        '-password -role -account_type -code_id -code_expired -auth_providers',
      )
      .populate({
        path: 'job_id',
        populate: {
          path: 'city_id',
          select: 'name',
        },
      });
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
  }
}
