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
import { SaveCandidate } from '../save_candidates/schema/SaveCandidates.schema';
import { Job } from '../job/schema/Job.schema';
import { NotificationService } from 'src/notification/notification.service';
import { User } from '../users/schemas/user.schema';
import { IApplicationService } from './application.interface';
import { Meta } from '../types';
import { LogService } from 'src/log/log.service';
import { Request } from 'express';
import { CompanyApplicationStatus } from './schema/CompanyApplicationStatus.schema';
import { CompanyStatusService } from './company-status.service';

@Injectable()
export class ApplicationService implements IApplicationService {
  constructor(
    @InjectModel('Application')
    private applicationRepository: Model<Application>,
    @InjectModel('SaveCandidate')
    private saveCandidateModel: Model<SaveCandidate>,
    private notificationService: NotificationService,
    private logService: LogService,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel('Job') private jobModel: Model<Job>,
    @InjectModel(CompanyApplicationStatus.name)
    private companyStatusModel: Model<CompanyApplicationStatus>,
    private companyStatusService: CompanyStatusService,
  ) {}

  async create(
    createApplicationDto: CreateApplicationDto,
    req: Request,
  ): Promise<Application> {
    try {
      const session = await this.applicationRepository.startSession();
      session.startTransaction();

      // Get the default status for the company
      let defaultStatus;
      try {
        defaultStatus = await this.companyStatusService.getDefaultStatus(
          createApplicationDto.employer_id,
        );
      } catch {
        // If no status is found, create a default one
        defaultStatus = await this.companyStatusService.create(
          createApplicationDto.employer_id,
          {
            name: 'Pending',
            description: 'Application is pending review',
            order: 1,
            color: '#95a5a6',
            is_active: true,
          },
        );
      }

      // Set the default status in the application
      const newApplied = await this.applicationRepository.create({
        ...createApplicationDto,
        status: defaultStatus._id,
      });

      const job = await this.jobModel.findById(createApplicationDto.job_id);

      if (newApplied) {
        await this.jobModel.updateOne(
          { _id: newApplied.job_id },
          { $push: { candidate_ids: new Types.ObjectId(newApplied?.user_id) } },
        );
        const employer = await this.userModel.findById(
          createApplicationDto.employer_id,
        );
        const candidate = await this.userModel.findById(
          createApplicationDto.user_id,
        );

        await this.logService.createLog({
          userId: new Types.ObjectId(candidate._id.toString()),
          userRole: 'CANDIDATE',
          action: 'APPLY',
          entityId: newApplied._id.toString(),
          entityCollection: 'Application',
          description: 'Candidate applied for job',
          entityName: job?.title,
          activityDetail: 'applied_job',
          req: req,
        });
        this.notificationService.notificationWhenCandidateAppliedEmployer(
          candidate,
          employer,
          'candidate_applied',
          job.title,
          newApplied._id.toString(),
        );

        return newApplied;
      } else {
        await session.abortTransaction();
        throw new NotFoundException('Failed to apply for job');
      }
    } catch (error) {
      throw new NotFoundException(error);
    }
  }

  async findAll(
    query: string,
    current: number,
    pageSize: number,
  ): Promise<{ items: Application[]; meta: Meta }> {
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
      .sort(sort as any)
      .populate(
        'employer_id',
        '-password -role -account_type -code_id -code_expired -auth_providers',
      )
      .populate({
        path: 'job_id',
        populate: [
          {
            path: 'city_id',
            select: 'name',
          },
          {
            path: 'type_money',
            select: 'symbol',
          },
          { path: 'job_type', select: 'name' },
        ],
      });

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

  async findOne(id: string): Promise<Application> {
    try {
      const applied = (await this.applicationRepository.findById(id)).populate(
        'cv_id',
      );
      console.log('aplied', applied);
      if (applied) {
        return applied;
      } else {
        throw new NotFoundException();
      }
    } catch (error) {
      throw new NotFoundException(error);
    }
  }

  async update(
    id: string,
    updateApplicationDto: UpdateApplicationDto,
  ): Promise<Application> {
    try {
      const applied = await this.applicationRepository
        .findByIdAndUpdate(id, updateApplicationDto, {
          new: true,
        })
        .populate('job_id')
        .populate('status');

      if (applied) {
        const candidate = await this.userModel.findOne({
          _id: applied.user_id,
        });
        const employer = await this.userModel.findOne({
          _id: applied.employer_id,
        });
        const job = await this.jobModel.findOne({
          _id: applied.job_id,
        });

        // Get the status name from the populated status object
        const statusName = (applied.status as any).name?.toLowerCase();

        // Check if the status is equivalent to rejected or accepted
        if (
          (statusName === 'rejected' || statusName === 'accepted') &&
          candidate.notification_when_employer_reject_cv
        ) {
          this.notificationService.notificationWhenChangeStatusApplication(
            candidate,
            employer,
            statusName as 'accepted' | 'rejected',
            job.title,
            applied._id + '',
          );
        }
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
        employer: new Types.ObjectId(application.employer_id),
        candidate: userIdObject,
      });
    } else {
      application.save_candidates.push(userIdObject);
      // thêm vào bảng save-candidate
      const employer = await this.userModel.findOne({
        _id: new Types.ObjectId(application.employer_id),
      });
      const candidate = await this.userModel.findOne({
        _id: userIdObject,
      });
      if (candidate.notification_when_employer_save_profile) {
        this.notificationService.notificationWhenEmployerSaveCandidate(
          candidate,
          employer,
        );
      }
      await this.saveCandidateModel.create({
        employer: new Types.ObjectId(application.employer_id),
        candidate: userIdObject,
        isActive: true,
      });
    }

    return application.save(); // Lưu lại thay đổi vào database
  }

  async remove(data: DeleteApplicationDto): Promise<[]> {
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
  ): Promise<{ items: Application[]; meta: Meta }> {
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
      .populate('cv_id')
      .populate('status')
      .populate({
        path: 'employer_id',
        select: '_id name full_name phone address role',
      })
      .populate({
        path: 'user_id',
        select:
          '_id name email full_name phone address role education_ids avatar total_experience_years total_experience_months no_experience cv_ids',
        populate: [
          {
            path: 'education_ids',
            select: 'school major start_date currently_studying',
          },
          {
            path: 'work_experience_ids',
          },
          { path: 'primary_cv_id' },
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
  async cancelApplication(
    applicationId: string,
    userId: string,
    // eslint-disable-next-line prettier/prettier
  ): Promise<{ message: string }> {
    try {
      const application = await this.applicationRepository.findOne({
        _id: applicationId,
        user_id: userId,
      });

      if (!application) {
        throw new NotFoundException('Application not found');
      }

      // Xóa bản ghi ứng tuyển
      const deleted = await this.applicationRepository.deleteOne({
        _id: applicationId,
      });

      if (deleted.deletedCount > 0) {
        return { message: 'Application cancelled successfully' };
      }
      // Xóa user_id khỏi mảng candidate_ids trong Job
      await this.jobModel.updateOne(
        { _id: application.job_id },
        { $pull: { candidate_ids: userId } }, // Xóa user_id khỏi danh sách candidate_ids
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getAppliedUserId(userId: string): Promise<number> {
    try {
      const count = await this.applicationRepository.countDocuments({
        user_id: userId,
      });
      return count;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getRecentlyApplied(
    candidateId: string,
    query: string,
    current: number,
    pageSize: number,
  ): Promise<{ items: Application[]; meta: Meta }> {
    try {
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
      // const res = await this.applicationRepository
      //   .find({ user_id: candidateId })
      //   .populate({
      //     path: 'job_id',
      //     populate: {
      //       path: 'city_id', // Populate city_id in job_id
      //     },
      //   }) // Populate job details
      //   .populate(
      //     'employer_id',
      //     '-password -role -account_type -code_id -code_expired -auth_providers',
      //   )
      //   .sort({ applied_date: -1 }) // Sort by applied_date (descending)
      //   .limit(limit)
      //   .exec();
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
        select:
          '-professional_skills -min_experience -skill_name -general_requirements -interview_process -benefit -skills -candidate_ids -degree -level -job_responsibilities -job_contract_type -age_range -description -is_expired',
        populate: [
          {
            path: 'city_id',
            select: 'name',
          },
          {
            path: 'type_money',
            select: 'symbol',
          },
          { path: 'job_type', select: 'name key' },
        ],
      })
      .populate('cv_id');
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

  async getTop5RecentlyApplied(candidateId: string): Promise<Application[]> {
    try {
      console.log('candidateId', candidateId);
      const applications = await this.applicationRepository
        .find({
          user_id: candidateId,
        })
        .sort({ applied_date: -1 })
        .limit(5)
        .populate({
          path: 'job_id',
          select:
            '-professional_skills -min_experience -skill_name -general_requirements -interview_process -benefit -skills -candidate_ids -degree -level -job_responsibilities -job_contract_type -age_range -description -is_expired',
          populate: [
            {
              path: 'city_id',
              select: 'name',
            },
            {
              path: 'type_money',
              select: 'symbol',
            },
            { path: 'job_type', select: 'name key' },
          ],
        })
        .populate(
          'employer_id',
          'avatar_company banner_company full_name _id ',
        );

      return applications;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
