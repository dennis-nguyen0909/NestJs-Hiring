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

@Injectable()
export class ApplicationService {
  constructor(
    @InjectModel('Application')
    private applicationRepository: Model<Application>,
    @InjectModel('SaveCandidate')
    private saveCandidateModel: Model<SaveCandidate>,
  ) {}

  async create(createApplicationDto: CreateApplicationDto) {
    try {
      const findUser = await this.applicationRepository.findOne({
        user_id: createApplicationDto.user_id,
      });
      if (findUser) {
        throw new BadRequestException('User already applied');
      }
      const newApplied = await this.applicationRepository.create({
        ...createApplicationDto,
      });
      if (newApplied) {
        return newApplied;
      } else {
        throw new NotFoundException();
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
      console.log('updateApplicationDto', updateApplicationDto);
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
    console.log('duy test', filter);
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
}
