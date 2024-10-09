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
import { isArray } from 'class-validator';
import { error } from 'console';
import { DeleteSkillDto } from './dto/delete-skill.dto';

@Injectable()
export class SkillService {
  constructor(@InjectModel('Skill') private skillRepository: Model<Skill>) {}
  async create(createSkillDto: CreateSkillDto) {
    const skill = await this.skillRepository.create(createSkillDto);
    return skill;
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
      data: {
        items: result,
        meta: {
          count: result.length,
          current_page: current,
          per_page: pageSize,
          total: totalItems,
          total_pages: totalPages,
        },
      },
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} skill`;
  }

  update(id: number, updateSkillDto: UpdateSkillDto) {
    return `This action updates a #${id} skill`;
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
      throw new BadRequestException(error);
    }
  }
}
