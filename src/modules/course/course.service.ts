import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Course } from './schema/course.schema';
import { Model, Types } from 'mongoose';
import { User } from '../users/schemas/User.schema';

@Injectable()
export class CourseService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<Course>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}
  async create(createCourseDto: CreateCourseDto) {
    const course = await this.courseModel.create(createCourseDto);
    if (!course) {
      throw new BadRequestException('Create course failed');
    }
    const user = await this.userModel.findById(course.user_id);
    if (!user) {
      throw new NotFoundException(`user #${course.user_id} not found`);
    }
    const courseId = new Types.ObjectId(course._id + '');
    user.courses.push(courseId);
    await user.save();
    return course;
  }

  async findAll() {
    return this.courseModel.find().exec();
  }

  async findOne(id: string) {
    const course = await this.courseModel
      .findOne({ _id: id })
      // .populate('user_id')
      .exec();
    if (!course) {
      throw new NotFoundException(`course with ID ${id} not found`);
    }
    return course;
  }

  async update(id: string, updateCourseDto: UpdateCourseDto) {
    const course = await this.courseModel.findByIdAndUpdate(
      id,
      updateCourseDto,
      { new: true },
    );
    if (!course) {
      throw new NotFoundException(`Course #${id} not found`);
    }
    return course;
  }

  async remove(id: string, userId: string) {
    const course = await this.courseModel.findById(id).exec();
    if (!course) {
      throw new NotFoundException(`Course #${id} not found`);
    }

    // Chỉ cho phép chủ sở hữu khóa học xóa khóa học
    if (course.user_id.toString() !== userId) {
      throw new ForbiddenException('You are not allowed to delete this course');
    }

    // Xóa khóa học
    const result = await this.courseModel.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      throw new BadRequestException('Course not found or could not be deleted');
    }

    await this.userModel.updateOne(
      { _id: course.user_id },
      { $pull: { courses: new Types.ObjectId(id) } },
    );
  }
}
