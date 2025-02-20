import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Skill } from './schema/Skill.schema';
import aqp from 'api-query-params';
import { DeleteSkillDto } from './dto/delete-skill.dto';
import { User } from '../users/schemas/user.schema';
import { ISkillService } from './skill.interface';
import { Meta } from '../types';

@Injectable()
export class SkillService implements ISkillService {
  constructor(
    @InjectModel(Skill.name) private skillRepository: Model<Skill>,
    @InjectModel(User.name) private readonly userRepository: Model<User>,
  ) {}
  async create(createSkillDto: CreateSkillDto): Promise<Skill> {
    try {
      const skill = await this.skillRepository.create(createSkillDto);

      const user = await this.userRepository.findById(skill.user_id);
      if (user) {
        user.skills.push(new Types.ObjectId(skill._id.toString()));
        await user.save();
      }

      return skill;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
  async findAll(
    query: string,
    current: number,
    pageSize: number,
  ): Promise<{ items: Skill[]; meta: Meta }> {
    const { filter, sort } = aqp(query);
    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;

    if (!current) current = 1;
    if (!pageSize) pageSize = 10;

    const totalItems = (await this.skillRepository.find(filter)).length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (+current - 1) * pageSize;
    const result = await this.skillRepository
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

  async findOne(id: string): Promise<Skill> {
    const skill = await this.skillRepository.findOne({ _id: id });
    if (!skill) {
      throw new NotFoundException();
    }
    return skill;
  }

  async update(id: string, updateSkillDto: UpdateSkillDto): Promise<Skill> {
    const skill = await this.skillRepository.findOneAndUpdate(
      { _id: id }, // Điều kiện tìm kiếm
      updateSkillDto, // Dữ liệu cập nhật
      { new: true }, // Trả về đối tượng đã được cập nhật
    );

    if (!skill) {
      throw new NotFoundException(`Skill with id ${id} not found`);
    }

    return skill; // Trả về đối tượng skill đã được cập nhật
  }

  async remove(data: DeleteSkillDto): Promise<[]> {
    const { ids } = data;
    try {
      if (!Array.isArray(ids) || ids.length === 0) {
        throw new NotFoundException('Ids not found');
      }

      // Kiểm tra xem kỹ năng có tồn tại trong DB không
      const skills = await this.skillRepository.find({ _id: { $in: ids } });
      if (skills.length !== ids.length) {
        throw new NotFoundException('Some skills not found');
      }

      // Xóa kỹ năng khỏi skill repository
      const result = await this.skillRepository.deleteMany({
        _id: { $in: ids },
      });

      if (result.deletedCount > 0) {
        // Cập nhật lại các user, xóa các kỹ năng đã xóa khỏi trường `skills`
        await this.userRepository.updateMany(
          { skills: { $in: ids } }, // Tìm các user có chứa các kỹ năng bị xóa
          { $pull: { skills: { $in: ids } } }, // Xóa kỹ năng khỏi mảng `skills`
        );
        return [];
      } else {
        throw new BadRequestException('Delete failed');
      }
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async getSkillsByUserId(userId: string): Promise<Skill[]> {
    try {
      const res = await this.skillRepository.find({ user_id: userId }).exec();
      if (!res) {
        throw new NotFoundException('Not found!');
      }
      return res;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
