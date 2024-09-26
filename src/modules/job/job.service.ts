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

@Injectable()
export class JobService {
  constructor(
    @InjectModel('Job') private jobRepository: Model<Job>,
    private userService: UsersService,
  ) {}
  async create(createJobDto: CreateJobDto) {
    const { user_id } = createJobDto;
    const isUserExist = await this.userService.findOne(user_id);
    const user = await isUserExist.populate('role');
    if (isUserExist) {
      const user = await isUserExist.populate('role');
      if (user.role.role_name === 'EMPLOYER') {
        const job = await this.jobRepository.create(createJobDto);
        if (job) {
          return {
            message: 'Job created successfully',
            error: 200,
            data: job,
          };
        } else {
          return {
            message: 'Job not created',
            error: 201,
          };
        }
      } else {
        throw new UnauthorizedException('User is not an employer');
      }
    } else {
      return {
        message: 'User not found',
        error: 201,
      };
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
    const data = await this.jobRepository
      .find(filter)
      .limit(pageSize)
      .skip(skip)
      .sort(sort as any);
    return {
      data,
      totalItems,
      totalPages,
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} job`;
  }

  async update(id: string, updateJobDto: UpdateJobDto) {
    try {
      const job = await this.jobRepository.findByIdAndUpdate(id, updateJobDto, {
        new: true, // Trả về tài liệu mới sau khi cập nhật
        runValidators: true, // Kiểm tra các ràng buộc khi cập nhật
      });
      if (job) {
        return {
          message: 'Job updated successfully',
          error: 200,
          data: job,
        };
      } else {
        return {
          message: 'Job not updated',
          error: 201,
        };
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
          return {
            message: 'Delete success',
            error: 200,
          };
        } else {
          return {
            message: 'Delete failed',
            error: 201,
          };
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
          return {
            message: 'Delete success',
            error: 200,
          };
        } else {
          return {
            message: 'Delete failed',
            error: 201,
          };
        }
      }
    } catch (error) {
      throw new NotFoundException(error);
    }
  }
}
