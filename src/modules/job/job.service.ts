/* eslint-disable prettier/prettier */
import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Job } from './schema/Job.schema';
import { UsersService } from '../users/users.service';
import aqp from 'api-query-params';
import { DeleteJobDto } from './dto/delete-job.dto';
import { SkillEmployer } from '../skill_employer/schema/EmployerSkill.schema';
import { User } from '../users/schemas/user.schema';
import { Cities } from '../cities/schema/Cities.schema';
import { Level } from '../level/schema/Level.schema';
import { IJobService } from './job.interface';
import { Meta } from '../types';
import { JobType } from '../job-type/schema/JobType.schema';
import { JobContractType } from '../job-contract-type/schema/job-contract-type.schema';
import { LogService } from 'src/log/log.service';
import { Request } from 'express';

@Injectable()
export class JobService implements IJobService {
  constructor(
    @InjectModel(Job.name) private jobRepository: Model<Job>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Cities.name) private cityModel: Model<Cities>,
    @InjectModel(Level.name) private levelModel: Model<Cities>,
    @InjectModel(SkillEmployer.name)
    private employerModel: Model<SkillEmployer>,
    private userService: UsersService,
    private logService: LogService,
  ) {}
  validateExpiryDate(expireDate: string): void {
    throw new Error('Method not implemented.');
  }
  validateSalaryRange(salaryRange: { min: number; max: number }): void {
    throw new Error('Method not implemented.');
  }
  async create(createJobDto: CreateJobDto, request: Request): Promise<Job> {
    const session = await this.jobRepository.startSession();
    session.startTransaction(); // Bắt đầu transaction

    try {
      const {
        user_id,
        expire_date,
        salary_range_max,
        salary_range_min,
        age_range,
      } = createJobDto;
      console.log('create', createJobDto.expire_date);
      // Kiểm tra người dùng có tồn tại và có phải là EMPLOYER
      const userExist = await this.userService.findByObjectId(user_id + '');
      if (!userExist) {
        throw new BadRequestException('User not found');
      }

      const user = await userExist.populate('role');
      if (user.role.role_name !== 'EMPLOYER') {
        throw new UnauthorizedException('User is not an employer');
      }

      // Kiểm tra ngày hết hạn (expiry_date) phải lớn hơn ngày hiện tại
      const currentDate = new Date();
      const jobExpiryDate = new Date(expire_date);
      if (jobExpiryDate <= currentDate) {
        throw new BadRequestException(
          'Expiry date must be later than the current date',
        );
      }
      CreateJobDto.validateSalaryRange(salary_range_min, salary_range_max);

      if (age_range?.min >= age_range?.max) {
        throw new BadRequestException('Age range max must be greater than min');
      }

      if (createJobDto.skills) {
        createJobDto.skills = createJobDto.skills.map((skill) => {
          return new Types.ObjectId(skill + '');
        });
      }

      // Tạo job
      const job = await this.jobRepository.create(
        [
          {
            ...createJobDto,
            city_id: new Types.ObjectId(createJobDto.city_id),
            district_id: new Types.ObjectId(createJobDto.district_id),
            level: new Types.ObjectId(createJobDto.level),
            type_money: new Types.ObjectId(createJobDto.type_money),
            degree: new Types.ObjectId(createJobDto.degree),
            ward_id: new Types.ObjectId(createJobDto.ward_id),
            job_type: new Types.ObjectId(createJobDto.job_type),
            job_contract_type: new Types.ObjectId(
              createJobDto.job_contract_type,
            ),
            user_id: new Types.ObjectId(userExist._id + ''),
          },
        ],
        { session },
      ); // Pass session vào create

      if (job) {
        // Tạo log
        await this.logService.createLog({
          userId: new Types.ObjectId(userExist._id + ''),
          userRole: userExist?.role?.role_name,
          action: 'CREATE',
          entityId: job[0]._id.toString(),
          entityCollection: 'jobs',
          entityName: job[0]?.title,
          activityDetail: 'user_create_job',
          req: request,
        });

        // Thêm job vào user
        user.jobs_ids.push(new Types.ObjectId(job[0]._id + ''));
        await user.save({ session }); // Pass session vào user.save()

        // Commit transaction nếu tất cả đều thành công
        await session.commitTransaction();
        session.endSession();

        return job[0];
      } else {
        throw new BadRequestException('Create job failed');
      }
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  async findAll(
    query: string,
    current: number,
    pageSize: number,
    sortParams: any,
  ): Promise<{ items: any[]; meta: Meta }> {
    const { filter, sort } = aqp(query);

    // Loại bỏ các trường không liên quan ra khỏi filter
    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;
    if (!current) current = 1;
    if (!pageSize) current = 10;
    if (filter?.keyword && filter?.keyword['$exists'] === true) {
      delete filter.keyword;
    }
    if (filter?.city_id && filter?.city_id['$exists'] === true) {
      delete filter.city_id;
    }
    if (filter?.district_id && filter?.district_id['$exists'] === true) {
      delete filter.district_id;
    }
    if (filter?.job_type && filter?.job_type['$exists'] === true) {
      delete filter.job_type;
    }
    if (
      filter?.job_contract_type &&
      filter?.job_contract_type['$exists'] === true
    ) {
      delete filter.job_contract_type;
    }
    // Nếu có keyword, tìm kiếm trong trường skill_name
    if (filter?.keyword) {
      const keywordRegex = {
        $regex: filter.keyword.toString().trim(),
        $options: 'i',
      };

      if (filter?.user_id) {
        filter.$or = [
          { skill_name: { $elemMatch: keywordRegex } },
          { title: keywordRegex },
        ];
      } else {
        filter.$or = [
          { skill_name: { $elemMatch: keywordRegex } },
          { title: keywordRegex },
          { company_name: keywordRegex },
        ];
      }
      delete filter.keyword; // Xóa keyword sau khi đã sử dụng
    }
    if (filter?.job_type) {
      // Nếu job_type là mảng, sử dụng $in để lọc các công việc có chứa các ObjectId trong mảng
      if (Array.isArray(filter.job_type['$in'])) {
        filter.job_type = {
          $in: filter.job_type['$in'].map((id) => new Types.ObjectId(id)),
        };
      } else {
        // Nếu chỉ là 1 giá trị đơn, chuyển thành ObjectId bình thường
        filter.job_type = new Types.ObjectId(filter.job_type);
      }
    }
    if (filter?.job_contract_type) {
      // Nếu job_contract_type là mảng, sử dụng $in để lọc các công việc có chứa các ObjectId trong mảng
      if (Array.isArray(filter.job_contract_type['$in'])) {
        filter.job_contract_type = {
          $in: filter.job_contract_type['$in'].map(
            (id) => new Types.ObjectId(id),
          ),
        };
      } else {
        // Nếu chỉ là 1 giá trị đơn, chuyển thành ObjectId bình thường
        filter.job_contract_type = new Types.ObjectId(filter.job_contract_type);
      }
    }

    if (filter?.city_id) {
      filter.city_id = new Types.ObjectId(filter.city_id);
    }
    if (filter?.user_id) {
      filter.user_id = new Types.ObjectId(filter.user_id);
    }
    if (filter?.district_id) {
      filter.district_id = new Types.ObjectId(filter.district_id);
    }
    console.log('filter 123123', filter);
    const defaultSort = { createdAt: 'desc' };
    const sortCriteria = sort || sortParams?.sort || defaultSort;

    // Tối ưu hóa đếm số lượng tài liệu
    const totalItems = await this.jobRepository.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (+current - 1) * pageSize;

    // Truy vấn và populate dữ liệu với lean() để giảm overhead
    const result = await this.jobRepository
      .find(filter)
      .limit(pageSize)
      .skip(skip)
      .sort(sortCriteria as any)
      .populate({
        path: 'city_id',
        select: 'name _id',
      })
      .populate({
        path: 'district_id',
        select: 'name _id',
      })
      .populate({
        path: 'skills', // Populate kỹ năng
        model: SkillEmployer.name,
        select: '_id name', // Lấy trường _id và name từ collection `skills`
      })
      .populate({
        path: 'user_id',
        model: User.name,
        select: 'company_name _id avatar_company',
      })
      .populate('type_money', '_id symbol code')
      .populate('level', '_id name key')
      .populate({
        path: 'job_type',
        model: JobType.name,
        select: '_id name key',
      })
      .populate({
        path: 'job_contract_type',
        model: JobContractType.name,
        select: '_id name key',
      })
      .select(
        'title _id salary_range_min salary_range_max is_negotiable job_type job_contract_type createdAt is_active is_expired count_apply candidate_ids expire_date skill_name',
      )
      .lean();
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

  // async findAll(query: string, current: number, pageSize: number): Promise<{ items: Job[], meta: Meta }> {
  //   const { filter, sort } = aqp(query);

  //   // Kiểm tra và loại bỏ các trường không cần thiết từ filter
  //   if (filter.current) delete filter.current;
  //   if (filter.pageSize) delete filter.pageSize;
  //   if (!current) current = 1;
  //   if (!pageSize) pageSize = 10;

  //   try {
  //     // Chuyển các giá trị ID thành ObjectId nếu có
  //     if (filter.job_type) {
  //       filter['job_type'] = new Types.ObjectId(filter.job_type);
  //     }
  //     if (filter.user_id) {
  //       filter['user_id'] = new Types.ObjectId(filter.user_id);
  //     }
  //     if (filter.city_id) {
  //       filter['city_id'] = new Types.ObjectId(filter.city_id);
  //     }
  //   } catch (err) {
  //     console.error("Invalid ObjectId conversion:", err.message);
  //   }

  //   // Xử lý tìm kiếm với keyword (tìm theo title, company_name hoặc skills)
  //   if (filter.keyword) {
  //     const keyword = new RegExp(filter.keyword, 'i');

  //     // Tìm kiếm các kỹ năng (skills)
  //     const matchingSkills = await this.employerModel.find({ name: keyword }).select('_id');
  //     const skillIds = matchingSkills.map(skill => new Types.ObjectId(skill._id+''));

  //     filter.$or = [
  //       { title: keyword },
  //       { 'user_id.company_name': keyword },
  //       { 'city_id': filter.city_id },
  //       ...(skillIds.length > 0 ? [{ skills: { $in: skillIds } }] : []),
  //     ];

  //     delete filter.keyword;  // Xóa keyword sau khi đã sử dụng
  //   }

  //   // Xử lý lọc theo mức lương
  //   if (filter.salary_range_min !== undefined || filter.salary_range_max !== undefined) {
  //     filter['salary_range'] = {
  //       min: filter.salary_range_min,
  //       max: filter.salary_range_max === 'Infinity' ? Infinity : filter.salary_range_max,
  //     };
  //     delete filter.salary_range_min;
  //     delete filter.salary_range_max;
  //   }
  // console.log("filter",filter)
  //   // Pipeline tìm kiếm công việc với các lookup từ các bảng khác
  //   const pipeline: PipelineStage[] = [
  //     {
  //       $lookup: {
  //         from: 'users',
  //         localField: 'user_id',
  //         foreignField: '_id',
  //         as: 'user_id',
  //       },
  //     },
  //     { $unwind: '$user_id' },
  //     {
  //       $lookup: {
  //         from: 'skillemployers',
  //         localField: 'skills',
  //         foreignField: '_id',
  //         as: 'skills',
  //       },
  //     },
  //     {
  //       $lookup: {
  //         from: 'cities',
  //         localField: 'city_id',
  //         foreignField: '_id',
  //         as: 'city_id',
  //       },
  //     },
  //     { $unwind: '$city_id' },  // Giải nén city_id
  //     {
  //       $lookup: {
  //         from: 'districts',
  //         localField: 'district_id',
  //         foreignField: '_id',
  //         as: 'district_id',
  //       },
  //     },
  //     { $unwind: '$district_id' },
  //     {
  //       $lookup: {
  //         from: 'jobcontracttypes',
  //         localField: 'job_contract_type',
  //         foreignField: '_id',
  //         as: 'job_contract_type',
  //       },
  //     },
  //     { $unwind: '$job_contract_type' },
  //     {
  //       $lookup: {
  //         from: 'jobtypes',
  //         localField: 'job_type',
  //         foreignField: '_id',
  //         as: 'job_type',
  //       },
  //     },
  //     { $unwind: '$job_type' },
  //     { $match: { ...filter } }, // Áp dụng filter
  //     { $skip: (current - 1) * pageSize }, // Phân trang
  //     { $limit: pageSize },
  //     {
  //       $project: {
  //         '_id': 1,
  //         'title': 1,
  //         'district_id': 1,
  //         'city_id': 1,
  //         'skills': 1,
  //         'is_negotiable': 1,
  //         'is_expired': 1,
  //         'job_type': 1,
  //         'expire_date': 1,
  //         'posted_date': 1,
  //         'is_active': 1,
  //         'job_contract_type': 1,
  //         'salary_range': 1,
  //         'user_id.company_name': 1,
  //         'user_id._id': 1,
  //         'user_id.avatar_company': 1,
  //       },
  //     },
  //   ];

  //   // Tính toán tổng số công việc và số trang
  //   const totalItemsResult = await this.jobRepository.aggregate([
  //     ...pipeline.slice(0, -3),  // Loại bỏ các phần pagination và project để tính tổng
  //     { $count: 'total' },
  //   ]);

  //   const totalItems = totalItemsResult.length > 0 ? totalItemsResult[0].total : 0;
  //   const totalPages = totalItems > 0 ? Math.ceil(totalItems / pageSize) : 0;

  //   // Truy vấn dữ liệu công việc theo pipeline
  //   const result = await this.jobRepository.aggregate(pipeline);

  //   return {
  //     items: result,
  //     meta: {
  //       count: result.length,
  //       current_page: current,
  //       per_page: pageSize,
  //       total: totalItems,
  //       total_pages: totalPages,
  //     },
  //   };
  // }

  async findOne(id: string, user_id: string): Promise<Job> {
    const job = await this.jobRepository
      .findById(id)
      .populate({
        path: 'user_id',
        populate: [
          {
            path: 'organization',
          },
          { path: 'social_links' },
        ],
        select: 'company_name _id avatar_company banner_company',
      })
      .populate('city_id', '-districts')
      .populate('district_id', '-wards')
      .populate('skills', '-createdAt -updatedAt -description -user_id')
      .populate('degree')
      .populate('type_money')
      .populate('level')
      .populate('job_contract_type')
      .populate('job_type')
      .populate('ward_id');

    if (!job) {
      throw new NotFoundException();
    }

    try {
      console.log('user_id', user_id);
      const userDoc = await this.userModel.findById(user_id);

      if (userDoc && !userDoc.viewed_jobs.includes(new Types.ObjectId(id))) {
        const user = await this.userModel.findByIdAndUpdate(
          user_id,
          {
            $addToSet: { viewed_jobs: new Types.ObjectId(id) },
          },
          { new: true },
        );
        console.log('user', user);
      }
    } catch (error) {
      console.error('Error updating viewed_jobs:', error);
      // Continue execution even if updating viewed_jobs fails
    }

    return job;
  }

  async update(id: string, updateJobDto: UpdateJobDto): Promise<Job> {
    try {
      const {
        expire_date,
        age_range,
        user_id,
        city_id,
        district_id,
        ward_id,
        job_contract_type,
        level,
        type_money,
        degree,
        skills,
        professional_skills,
        job_responsibilities,
        interview_process,
        salary_range_max,
        salary_range_min,
      } = updateJobDto;

      if (expire_date) {
        const currentDate = new Date();
        const jobExpiryDate = new Date(expire_date);
        if (jobExpiryDate <= currentDate) {
          throw new BadRequestException(
            'Expiry date must be later than the current date',
          );
        }
      }

      CreateJobDto.validateSalaryRange(salary_range_min, salary_range_max);

      // Kiểm tra age_range max phải lớn hơn min
      if (age_range?.min >= age_range?.max) {
        throw new BadRequestException('Age range max must be greater than min');
      }

      // Convert ObjectId fields in updateJobDto
      if (user_id) updateJobDto.user_id = new Types.ObjectId(user_id);
      if (city_id) updateJobDto.city_id = new Types.ObjectId(city_id);
      if (district_id)
        updateJobDto.district_id = new Types.ObjectId(district_id);
      if (ward_id) updateJobDto.ward_id = new Types.ObjectId(ward_id);
      if (job_contract_type)
        updateJobDto.job_contract_type = new Types.ObjectId(job_contract_type);
      if (level) updateJobDto.level = new Types.ObjectId(level);
      if (type_money) updateJobDto.type_money = new Types.ObjectId(type_money);
      if (degree) updateJobDto.degree = new Types.ObjectId(degree);

      // Convert skills and professional_skills (if they contain ObjectId references)
      if (skills && Array.isArray(skills)) {
        updateJobDto.skills = skills.map((skill) => new Types.ObjectId(skill));
      }

      if (professional_skills && Array.isArray(professional_skills)) {
        updateJobDto.professional_skills = professional_skills.map((skill) => {
          return {
            ...skill,
          };
        });
      }

      // Convert job_responsibilities and interview_process if they contain ObjectId references
      if (job_responsibilities && Array.isArray(job_responsibilities)) {
        updateJobDto.job_responsibilities = job_responsibilities.map(
          (responsibility) => responsibility,
        );
      }

      if (interview_process && Array.isArray(interview_process)) {
        updateJobDto.interview_process = interview_process.map(
          (process) => process,
        );
      }

      // Tiến hành cập nhật công việc nếu tất cả các kiểm tra đều hợp lệ
      const job = await this.jobRepository.findByIdAndUpdate(
        new Types.ObjectId(id),
        updateJobDto,
        {
          new: true, // Trả về tài liệu mới sau khi cập nhật
          runValidators: true, // Kiểm tra các ràng buộc khi cập nhật
        },
      );

      if (!job) {
        throw new NotFoundException('Job not found');
      }

      return job;
    } catch (error) {
      throw new NotFoundException(error);
    }
  }
  async remove(data: DeleteJobDto): Promise<[]> {
    const { user_id, ids } = data;
    try {
      if (ids.length < 0) {
        throw new BadRequestException('Ids not found');
      }
      if (!Array.isArray(ids)) {
        throw new BadRequestException('Ids phai la mang');
      }
      if (ids.length === 1) {
        const job = await this.jobRepository.findById(ids[0]);
        if (!job) {
          throw new NotFoundException();
        }
        if (job.user_id + '' !== user_id) {
          throw new UnauthorizedException();
        }
        const result = await this.jobRepository.deleteOne({ _id: ids[0] });
        if (result.deletedCount > 0) {
          await this.userModel.updateOne(
            { _id: ids[0] },
            { $pull: { jobs_ids: ids[0] } },
          );
          return [];
        } else {
          throw new BadRequestException('Delete failed!');
        }
      } else {
        const jobs = await this.jobRepository.find({ _id: { $in: ids } });
        if (!jobs) {
          throw new NotFoundException();
        }
        jobs.map((job) => {
          if (job.user_id + '' !== user_id) {
            throw new UnauthorizedException('ko co quyen');
          }
        });
        const result = await this.jobRepository.deleteMany({
          _id: { $in: ids },
        });
        if (result.deletedCount > 0) {
          await this.userModel.updateMany(
            { _id: { $in: ids } },
            { $pull: { jobs_ids: { $in: ids } } },
          );
          return [];
        } else {
          throw new BadRequestException('Delete failed!');
        }
      }
    } catch (error) {
      throw new NotFoundException(error);
    }
  }

  async getJobByEmployer(
    user_id: string,
    query: string,
    current: number,
    pageSize: number,
  ): Promise<{ items: Job[]; meta: Meta }> {
    // Sử dụng aqp (Advanced Query Parsing) để phân tích cú pháp `query` thành filter và sort
    const { filter, sort } = aqp(query);

    // Xóa `current` và `pageSize` khỏi filter nếu chúng tồn tại
    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;

    // Đặt giá trị mặc định cho current và pageSize nếu không có
    if (!current) current = 1;
    if (!pageSize) pageSize = 10;

    // Thêm điều kiện filter theo `user_id`
    filter.user_id = user_id;

    // Đếm tổng số công việc theo filter
    const totalItems = (await this.jobRepository.find(filter)).length;

    // Tính tổng số trang dựa trên tổng số công việc và số lượng công việc trên mỗi trang
    const totalPages = Math.ceil(totalItems / pageSize);

    // Tính số lượng công việc bỏ qua để phân trang
    const skip = (current - 1) * pageSize;

    // Lấy danh sách công việc dựa trên filter, limit, skip và sort
    const result = await this.jobRepository
      .find(filter)
      .limit(pageSize)
      .skip(skip)
      .sort(sort as any) // sort theo tiêu chí sort đã phân tích từ query
      .populate({
        path: 'city_id',
        select: '-districts',
      })
      .populate({
        path: 'district_id',
        select: '-wards',
      })
      .populate({
        path: 'skills',
        model: SkillEmployer.name,
        select: '-createdAt -updatedAt -description',
      })
      .populate('degree')
      .populate('type_money')
      .populate('level')
      .populate('job_contract_type')
      .populate('job_type');

    // Trả về kết quả cùng với metadata phân trang
    return {
      items: result,
      meta: {
        count: result.length, // Số lượng công việc trả về trong kết quả này
        current_page: current, // Trang hiện tại
        per_page: pageSize, // Số lượng công việc trên mỗi trang
        total: totalItems, // Tổng số công việc phù hợp với filter
        total_pages: totalPages, // Tổng số trang
      },
    };
  }

  async getJobByDistrict(
    id: string,
    current: number,
    pageSize: number,
    query: string,
  ): Promise<Job[]> {
    const { filter, sort } = aqp(query);
    if (!current) current = 1;
    if (!pageSize) pageSize = 10;
    const totalItems = (await this.jobRepository.find(filter)).length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (+current - 1) * pageSize;

    const res = await this.jobRepository
      .find({
        district_id: id,
      })
      .limit(pageSize)
      .skip(skip)
      .sort(sort as any);
    if (!res || res.length === 0) {
      throw new NotFoundException(`No jobs found in district with id: ${id}`);
    }
    return res;
  }

  async findRecentJobs(
    query: string,
    current: number,
    pageSize: number,
  ): Promise<{ items: Job[]; meta: Meta }> {
    const { filter, sort } = aqp(query); // Sử dụng `aqp` để phân tích query string thành bộ lọc
    if (filter.current) delete filter.current; // Xóa các tham số phân trang không cần thiết từ filter
    if (filter.pageSize) delete filter.pageSize;
    if (!current) current = 1;
    if (!pageSize) pageSize = 10;
    if (filter?.user_id) {
      filter['user_id'] = new Types.ObjectId(filter?.user_id);
    }

    // Đếm tổng số công việc dựa trên bộ f
    const totalItems = await this.jobRepository.countDocuments(filter);

    // Tính toán số trang dựa trên tổng số công việc và kích thước trang
    const totalPages = Math.ceil(totalItems / pageSize);

    // Tính toán số lượng công việc cần bỏ qua
    const skip = (current - 1) * pageSize;

    // Truy vấn dữ liệu từ database với phân trang
    const jobs = await this.jobRepository
      .find(filter)
      .limit(pageSize)
      .skip(skip)
      .sort(sort as any)
      .populate({
        path: 'city_id',
        select: '-districts',
      })
      .populate({
        path: 'district_id',
        select: '-wards',
      })
      .populate({
        path: 'skills',
        model: SkillEmployer.name,
        select: '-createdAt -updatedAt -description',
      })
      .populate({
        path: 'user_id',
        model: User.name,
        select:
          '-password -avatar -role -is_active -is_deleted -createdAt -updatedAt -__v',
      })
      .populate('degree')
      .populate('type_money')
      .populate('level')
      .populate('job_contract_type')
      .populate('job_type');

    // Trả về kết quả cùng metadata phân trang
    return {
      items: jobs,
      meta: {
        count: jobs.length,
        current_page: current,
        per_page: pageSize,
        total: totalItems,
        total_pages: totalPages,
      },
    };
  }
  async countActiveJobsByUser(userId: string): Promise<number> {
    return await this.jobRepository.countDocuments({
      user_id: new Types.ObjectId(userId),
      is_active: true,
    });
  }

  async toggleLikeJob(user_id: string, job_id: string): Promise<void> {
    try {
      const user = await this.userService.findByObjectId(user_id);
      const job = await this.jobRepository.findById(job_id);
      const jobId = new Types.ObjectId(job._id + '');
      if (user.favorite_jobs.includes(jobId)) {
        await this.userModel.updateOne(
          {
            _id: user._id,
          },
          {
            $pull: { favorite_jobs: jobId },
          },
        );
      } else {
        user.favorite_jobs.push(jobId);
        await user.save();
      }
    } catch (error) {
      throw new BadGatewayException(error);
    }
  }

  async findJobsByCompanyName(
    query: any,
    current: number,
    pageSize: number,
  ): Promise<{ items: Job[]; meta: Meta }> {
    try {
      const { filter, sort } = aqp(query);
      if (filter.current) delete filter.current;
      if (filter.pageSize) delete filter.pageSize;
      if (!current) current = 1;
      if (!pageSize) pageSize = 10;

      if (filter.keyword) {
        query.title = { $eq: filter.keyword };
      }

      if (query?.title) {
        query.title = { $regex: query.title, $options: 'i' };
      }
      if (query?.title === '') {
        delete query.title;
      }
      if (
        query?.city_id?.codename &&
        query?.city_id?.codename !== 'all-locations'
      ) {
        const res = await this.cityModel.find({
          codename: query?.city_id?.codename,
        });
        if (res) {
          query.city_id = res[0]?._id?.toString();
        }
      }
      if (query?.city_id?.codename === 'all-locations') {
        delete query.city_id;
      }
      if (
        query?.job_contract_type &&
        query.job_contract_type !== 'tat_ca_loai_hop_dong'
      ) {
        query.job_contract_type = query.job_contract_type;
      }
      if (query?.job_contract_type === 'tat_ca_loai_hop_dong') {
        delete query.job_contract_type;
      }
      if (query?.level && query.level !== 'all_levels') {
        const levelRes = await this.levelModel.findOne({ key: query.level });
        if (levelRes) {
          query.level = levelRes._id.toString();
        } else {
          delete query.level; // If no matching level found, remove the filter
        }
      } else if (query?.level === 'all_levels') {
        delete query.level;
      }

      const totalItems = (await this.jobRepository.find(query)).length;
      const totalPages = Math.ceil(totalItems / pageSize);
      const skip = (+current - 1) * pageSize;
      const jobs = await this.jobRepository
        .find(query)
        .limit(pageSize)
        .skip(skip)
        .sort(sort as any)
        .populate('city_id', 'name')
        .populate('ward_id', 'name')
        .populate('district_id', 'name')
        .populate('skills')
        .populate('degree')
        .populate('type_money')
        .populate('level')
        .populate('job_contract_type')
        .populate('job_type')
        .populate('user_id', '-password -code_id -code_expired')
        .exec();

      await jobs.map((job) => {});
      // Nếu không tìm thấy công việc nào

      return {
        items: jobs,
        meta: {
          count: jobs.length,
          current_page: current,
          per_page: pageSize,
          total: totalItems,
          total_pages: totalPages,
        },
      };
    } catch (error) {
      throw new BadRequestException(
        error.message || 'An error occurred while searching for jobs',
      );
    }
  }

  async testSearch(
    query: any,
    current: number,
    pageSize: number,
  ): Promise<Job[] | []> {
    const { filter, sort } = aqp(query);

    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;

    if (!current) current = 1;
    if (!pageSize) pageSize = 10;

    // Nếu có query.title, tìm kiếm gần đúng theo title
    if (query?.title) {
      // Tìm kiếm theo tên công việc (title) gần đúng
      query.title = { $regex: query.title, $options: 'i' }; // Tìm kiếm không phân biệt chữ hoa chữ thường
    }

    // Nếu có query.skillsName, tìm kiếm gần đúng theo skillsName
    if (query?.skillsName) {
      // Tìm kiếm kỹ năng gần đúng theo tên kỹ năng
      const skills = await this.employerModel.find({
        name: { $regex: query.skillsName, $options: 'i' }, // Tìm kiếm kỹ năng gần đúng
      });

      // Nếu không có kỹ năng nào tìm được, trả về mảng rỗng
      if (skills.length === 0) {
        return [];
      }

      // Lấy mảng ObjectId của các kỹ năng tìm được và chuyển chúng thành ObjectId
      const skillIds = skills.map((skill) => skill._id + '');

      filter['skills'] = { $in: skillIds };
    }

    try {
      const jobs = await this.jobRepository
        .find({
          $or: [
            query?.title ? { title: query.title } : {},
            filter.skills ? { skills: { $in: filter.skills.$in } } : {},
          ],
        })
        .populate('skills')
        .skip((current - 1) * pageSize)
        .limit(pageSize);

      return jobs;
    } catch (error) {
      console.error('Error in search:', error);
      return [];
    }
  }
}
