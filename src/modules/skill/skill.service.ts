import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Skill } from './schema/Skill.schema';
import aqp from 'api-query-params';
import { DeleteSkillDto } from './dto/delete-skill.dto';

@Injectable()
export class SkillService {
  constructor(@InjectModel('Skill') private skillRepository: Model<Skill>) {}
  async create(createSkillDto: CreateSkillDto) {
    try {
      const skill = await this.skillRepository.create(createSkillDto);
      return skill;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async findAll(query: string, current: number, pageSize: number) {
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

  findOne(id: string) {
    const skill = this.skillRepository.findOne({ _id: id });
    if (!skill) {
      throw new NotFoundException();
    }
    return skill;
  }

  update(id: string, updateSkillDto: UpdateSkillDto) {
    const skill = this.skillRepository.updateOne({ _id: id }, updateSkillDto);
    if (!skill) {
      throw new NotFoundException();
    }
    return skill;
  }

  async remove(data: DeleteSkillDto) {
    const { ids } = data;
    try {
      if (!Array.isArray(ids) || ids.length < 0) {
        throw new NotFoundException('Ids not found');
      }
      if (ids.length === 1) {
        const checkNotExists = await this.skillRepository.findOne({
          _id: ids[0],
        });
        if (!checkNotExists) {
          throw new NotFoundException('Ids not found');
        }
        const result = await this.skillRepository.deleteOne({ _id: ids[0] });
        if (result.deletedCount > 0) {
          return [];
        } else {
          throw new BadRequestException('Delete failed');
        }
      } else {
        const checkNotExists = await this.skillRepository.findOne({
          _id: { $in: ids },
        });
        if (!checkNotExists) {
          throw new NotFoundException('Ids not found');
        }
        const result = await this.skillRepository.deleteMany({
          _id: { $in: ids },
        });

        if (result.deletedCount > 0) {
          return [];
        } else {
          throw new BadRequestException('Delete failed');
        }
      }
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
  async getSkillsByUserId(userId: string) {
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
