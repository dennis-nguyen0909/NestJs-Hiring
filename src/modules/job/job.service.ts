import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Job } from './schema/Job.schema';
import { UsersService } from '../users/users.service';
import aqp from 'api-query-params';
import { DeleteJobDto } from './dto/delete-job.dto';
import { CitiesService } from '../cities/cities.service';
import { SkillEmployer } from '../skill_employer/schema/EmployerSkill.schema';

@Injectable()
export class JobService {
  constructor(
    @InjectModel('Job') private jobRepository: Model<Job>,
    private userService: UsersService,
    private citiesService: CitiesService,
  ) {}
  async create(createJobDto: CreateJobDto) {
    const { user_id } = createJobDto;
    const isUserExist = await this.userService.findOne(user_id);
    if (isUserExist) {
      const user = await isUserExist.populate('role');
      if (user.role.role_name === 'EMPLOYER') {
        const job = await this.jobRepository.create(createJobDto);
        if (job) {
          return job;
        } else {
          throw new BadRequestException('Create job failed');
        }
      } else {
        throw new UnauthorizedException('User is not an employer');
      }
    } else {
      throw new BadRequestException('User not found');
    }
  }

  async findAll(query: string, current: number, pageSize: number) {
    const { filter, sort } = aqp(query);
    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;
    if (!current) current = 1;
    if (!pageSize) pageSize = 10;
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
      .populate('level');
    if (!job) {
      throw new NotFoundException();
    }
    return job;
  }

  async update(id: string, updateJobDto: UpdateJobDto) {
    try {
      const job = await this.jobRepository.findByIdAndUpdate(id, updateJobDto, {
        new: true, // Trả về tài liệu mới sau khi cập nhật
        runValidators: true, // Kiểm tra các ràng buộc khi cập nhật
      });
      if (job) {
        return job;
      } else {
        throw new BadRequestException('Update job failed');
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      throw new NotFoundException();
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
        if (job.user_id !== user_id) {
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
          if (job.user_id !== user_id) {
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
}
