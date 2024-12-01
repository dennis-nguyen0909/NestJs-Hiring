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
import { User } from '../users/schemas/User.schema';

@Injectable()
export class JobService {
  constructor(
    @InjectModel('Job') private jobRepository: Model<Job>,
    @InjectModel('User') private userModel: Model<User>,
    private userService: UsersService,
    private citiesService: CitiesService,
  ) {}
  async create(createJobDto: CreateJobDto) {
    const { user_id, expire_date, salary_range, age_range } = createJobDto;
  
    // Kiểm tra người dùng có tồn tại và có phải là EMPLOYER
    const isUserExist = await this.userService.findOne(user_id);
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
      throw new BadRequestException('Expiry date must be later than the current date');
    }
  
    // Kiểm tra salary_range max phải lớn hơn min
    if (salary_range?.min >= salary_range?.max) {
      throw new BadRequestException('Salary range max must be greater than min');
    }
  
    // Kiểm tra age_range max phải lớn hơn min
    if (age_range?.min >= age_range?.max) {
      throw new BadRequestException('Age range max must be greater than min');
    }
  
    // Nếu tất cả các kiểm tra đều vượt qua, tiếp tục tạo công việc
    const job = await this.jobRepository.create(createJobDto);
    if (job) {
      return job;
    } else {
      throw new BadRequestException('Create job failed');
    }
  }

  async findAll(query: string, current: number, pageSize: number) {
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
        { 'user_id.company': keyword }, // Lọc theo trường 'user_id.company'
      ];
      delete filter.keyword; // Xóa keyword khỏi filter sau khi sử dụng
    }
    if (filter.salary_range_min !== undefined || filter.salary_range_max !== undefined) {
      filter['salary_range'] =  {
        min:filter.salary_range_min,
        max:filter.salary_range_max
      };
         // Lọc salary_range_max nếu có và không phải là Infinity
      if(filter.salary_range.max === 'Infinity'){
        filter['salary_range'] =  {
          min:filter.salary_range_min,
          max:Infinity
        };
      }
      delete filter.salary_range_min;
      delete filter.salary_range_max;
    }
    
    // Ghi log chi tiết filter sau khi xử lý
    console.log('Filter being applied:', filter);
    
    

    console.log('filter',filter)
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

  async findOne(id: string) {
    const job = await this.jobRepository
      .findOne({ _id: id })
      .populate('user_id')
      .populate('city_id', '-districts')
      .populate('district_id', '-wards')
      .populate('skills')
      .populate('ward_id');
    if (!job) {
      throw new NotFoundException();
    }
    return job;
  }

  async update(id: string, updateJobDto: UpdateJobDto) {
    try {
      const { expire_date, salary_range, age_range ,is_negotiable} = updateJobDto;
  
      // Kiểm tra ngày hết hạn (expire_date) phải lớn hơn ngày hiện tại
      if (expire_date) {
        const currentDate = new Date();
        const jobExpiryDate = new Date(expire_date);
        if (jobExpiryDate <= currentDate) {
          throw new BadRequestException('Expiry date must be later than the current date');
        }
      }
      console.log("salaasdasd",salary_range)
  
      // Kiểm tra salary_range max phải lớn hơn min
      if (salary_range?.min >= salary_range?.max && is_negotiable===false ) {
        throw new BadRequestException('Salary range max must be greater than min');
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
  async remove(data: DeleteJobDto) {
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
        if (job.user_id !== new Types.ObjectId(user_id)) {
          throw new UnauthorizedException();
        }

        const result = await this.jobRepository.deleteOne({ _id: ids[0] });
        if (result.deletedCount > 0) {
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
          if (job.user_id !== new Types.ObjectId(user_id)) {
            throw new UnauthorizedException('ko co quyen');
          }
        });
        const result = await this.jobRepository.deleteMany({
          _id: { $in: ids },
        });
        if (result.deletedCount > 0) {
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
  ) {
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
      });

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
  ) {
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

  async findRecentJobs(query: string, current: number, pageSize: number) {
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
      });

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

  async toggleLikeJob(user_id:string,job_id:string){
    try {
      const user = await this.userService.findOne(user_id);
      const job = await this.jobRepository.findById(job_id);
      const jobId = new Types.ObjectId(job._id+"")
      if(user.favorite_jobs.includes(jobId)){
        await this.userModel.updateOne({
          _id:user._id
        },{
          $pull:{favorite_jobs:jobId}
        })
      }else{
        user.favorite_jobs.push(jobId);
        await user.save();
      }
    } catch (error) {
      throw new BadGatewayException(error)
    }
  }
}
