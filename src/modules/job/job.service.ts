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
import { Model, set, Types } from 'mongoose';
import { Job } from './schema/Job.schema';
import { UsersService } from '../users/users.service';
import aqp from 'api-query-params';
import { DeleteJobDto } from './dto/delete-job.dto';
import { CitiesService } from '../cities/cities.service';
import { SkillEmployer } from '../skill_employer/schema/EmployerSkill.schema';
import { User } from '../users/schemas/user.schema';
import { Cities } from '../cities/schema/Cities.schema';
import { Level } from '../level/schema/Level.schema';
import { IJobService } from './job.interface';
import { Meta } from '../types';

@Injectable()
export class JobService implements IJobService {
  constructor(
    @InjectModel('Job') private jobRepository: Model<Job>,
    @InjectModel('User') private userModel: Model<User>,
    @InjectModel(Cities.name) private cityModel: Model<Cities>,
    @InjectModel(Level.name) private levelModel: Model<Cities>,
    @InjectModel(SkillEmployer.name) private employerModel: Model<SkillEmployer>,
    private userService: UsersService,
  ) {}
  validateExpiryDate(expireDate: string): void {
    throw new Error('Method not implemented.');
  }
  validateSalaryRange(salaryRange: { min: number; max: number; }): void {
    throw new Error('Method not implemented.');
  }
  async create(createJobDto: CreateJobDto):Promise<Job> {
    const { user_id, expire_date, salary_range, age_range } = createJobDto;

    // Kiểm tra người dùng có tồn tại và có phải là EMPLOYER
    const isUserExist = await this.userService.findByObjectId(user_id);
    if (!isUserExist) {
      throw new BadRequestException('User not found');
    }

    const user = await isUserExist.populate('role');
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

    // Kiểm tra salary_range max phải lớn hơn min
    if (salary_range?.min >= salary_range?.max) {
      throw new BadRequestException(
        'Salary range max must be greater than min',
      );
    }

    // Kiểm tra age_range max phải lớn hơn min
    if (age_range?.min >= age_range?.max) {
      throw new BadRequestException('Age range max must be greater than min');
    }

    // Nếu tất cả các kiểm tra đều vượt qua, tiếp tục tạo công việc
    const job = await this.jobRepository.create(createJobDto);
    if (job) {
      user.jobs_ids.push(new Types.ObjectId(job?._id+""))
      user.save()
      return job;
    } else {
      throw new BadRequestException('Create job failed');
    }
  }

  async findAll(query: string, current: number, pageSize: number):Promise<{items:Job[],meta:Meta}> {
    const { filter, sort } = aqp(query);
    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;
    if (!current) current = 1;
    if (!pageSize) pageSize = 10;

    if (filter.keyword) {
      const keyword = new RegExp(filter.keyword, 'i'); // 'i' cho phép tìm kiếm không phân biệt chữ hoa/chữ thường
      filter.$or = [
        { title: keyword }, // Lọc theo trường 'title'
        { company: keyword }, // Lọc theo trường 'company'
        { 'user_id.company_name': keyword }, // Lọc theo trường 'user_id.company'
      ];
      delete filter.keyword; // Xóa keyword khỏi filter sau khi sử dụng
    }
    if (
      filter.salary_range_min !== undefined ||
      filter.salary_range_max !== undefined
    ) {
      filter['salary_range'] = {
        min: filter.salary_range_min,
        max: filter.salary_range_max,
      };
      // Lọc salary_range_max nếu có và không phải là Infinity
      if (filter.salary_range.max === 'Infinity') {
        filter['salary_range'] = {
          min: filter.salary_range_min,
          max: Infinity,
        };
      }
      delete filter.salary_range_min;
      delete filter.salary_range_max;
    }

    const totalItems = (await this.jobRepository.find(filter)).length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (+current - 1) * pageSize;
    const result = await this.jobRepository
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
          populate:[
            {
              path:'district_id'
            },
            {
              path:'city_id'
            }
          ]
      })
      .populate('degree')
      .populate('type_money')
      .populate('level')
      .populate('job_contract_type')
      .populate('job_type');
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

  async findOne(id: string):Promise<Job>{
    const job = await this.jobRepository
      .findOne({ _id: id })
      .populate({
        path:'user_id',
        populate:[
          {
            path:"organization"
          },
          {path:"social_links"}
        ]
      })
      .populate('city_id', '-districts')
      .populate('district_id', '-wards')
      .populate('skills')
      .populate('degree')
      .populate('type_money')
      .populate('level')
      .populate('job_contract_type')
      .populate('job_type')
      .populate('ward_id');
    if (!job) {
      throw new NotFoundException();
    }
    return job;
  }

  async update(id: string, updateJobDto: UpdateJobDto):Promise<Job> {
    try {
      const { expire_date, salary_range, age_range, is_negotiable } =
        updateJobDto;

      // Kiểm tra ngày hết hạn (expire_date) phải lớn hơn ngày hiện tại
      if (expire_date) {
        const currentDate = new Date();
        const jobExpiryDate = new Date(expire_date);
        if (jobExpiryDate <= currentDate) {
          throw new BadRequestException(
            'Expiry date must be later than the current date',
          );
        }
      }

      // Kiểm tra salary_range max phải lớn hơn min
      if (salary_range?.min >= salary_range?.max && is_negotiable === false) {
        throw new BadRequestException(
          'Salary range max must be greater than min',
        );
      }

      // Kiểm tra age_range max phải lớn hơn min
      if (age_range?.min >= age_range?.max) {
        throw new BadRequestException('Age range max must be greater than min');
      }

      // Tiến hành cập nhật công việc nếu tất cả các kiểm tra đều hợp lệ
      const job = await this.jobRepository.findByIdAndUpdate(id, updateJobDto, {
        new: true, // Trả về tài liệu mới sau khi cập nhật
        runValidators: true, // Kiểm tra các ràng buộc khi cập nhật
      });

      if (!job) {
        throw new NotFoundException('Job not found');
      }

      return job;
    } catch (error) {
      throw new NotFoundException(error);
    }
  }
  async remove(data: DeleteJobDto):Promise<[]> {
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
        if (job.user_id+"" !== user_id) {
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
          if (job.user_id+"" !== user_id) {
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
  ):Promise<{items:Job[],meta:Meta}>  {
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
      }).populate('degree')
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
  ):Promise<Job[]>  {
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

  async findRecentJobs(query: string, current: number, pageSize: number):Promise<{items:Job[],meta:Meta}>  {
    const { filter, sort } = aqp(query); // Sử dụng `aqp` để phân tích query string thành bộ lọc
    if (filter.current) delete filter.current; // Xóa các tham số phân trang không cần thiết từ filter
    if (filter.pageSize) delete filter.pageSize;

    if (!current) current = 1;
    if (!pageSize) pageSize = 10;

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
      .sort([['posted_date', -1]])
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
      user_id: userId,
      is_active: true,
    });
  }

  async toggleLikeJob(user_id: string, job_id: string) :Promise<void> {
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

  async findJobsByCompanyName(query: any,current:number,pageSize:number):Promise<{items:Job[],meta:Meta}> {
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
      if (query?.job_contract_type && query.job_contract_type !== 'tat_ca_loai_hop_dong') {
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
          delete query.level;  // If no matching level found, remove the filter
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
        .populate('city_id','name')
        .populate('ward_id','name')
        .populate('district_id','name')
        .populate('skills')
        .populate('degree')
        .populate('type_money')
        .populate('level')
        .populate('job_contract_type')
        .populate('job_type')
        .populate('user_id','-password -code_id -code_expired')
        .exec();

      await jobs.map((job)=>{
      })
      // Nếu không tìm thấy công việc nào

      return{
        items: jobs,
        meta: {
          count: jobs.length,
          current_page: current,
          per_page: pageSize,
          total: totalItems,
          total_pages: totalPages,
        },
      }
    } catch (error) {
      throw new BadRequestException(
        error.message || 'An error occurred while searching for jobs',
      );
    }
  }

  async testSearch(query: any, current: number, pageSize: number):Promise<Job[]|[]> {
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
        name: { $regex: query.skillsName, $options: 'i' } // Tìm kiếm kỹ năng gần đúng
      });
  
      // Nếu không có kỹ năng nào tìm được, trả về mảng rỗng
      if (skills.length === 0) {
        return [];
      }
  
      // Lấy mảng ObjectId của các kỹ năng tìm được và chuyển chúng thành ObjectId
      const skillIds = skills.map(skill => skill._id + "");
  
      filter['skills'] = { $in: skillIds };
    }
  
  
    try {
      const jobs = await this.jobRepository.find({
        $or: [
          query?.title ? { title: query.title } : {}, 
          filter.skills ? { skills: { $in: filter.skills.$in } } : {} 
        ]
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
