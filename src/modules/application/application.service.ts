import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { Model } from 'mongoose';
import { Application } from './schema/Application.schema';
import { InjectModel } from '@nestjs/mongoose';
import aqp from 'api-query-params';
import { DeleteApplicationDto } from './dto/delete-application.dto';

@Injectable()
export class ApplicationService {
  constructor(
    @InjectModel('Application')
    private applicationRepository: Model<Application>,
  ) {}

  async create(createApplicationDto: CreateApplicationDto) {
    try {
      const newApplied = await this.applicationRepository.create({
        ...createApplicationDto,
      });
      if (newApplied) {
        return {
          message: ['Applied successfully'],
          data: newApplied,
        };
      } else {
        throw new NotFoundException();
      }
    } catch (error) {
      throw new NotFoundException(error);
    }
  }

  async findAll(query: string, current: number, pageSize: number) {
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

  async findOne(id: string) {
    try {
      const applied = await this.applicationRepository.findById(id);
      if (applied) {
        return applied;
      } else {
        throw new NotFoundException();
      }
    } catch (error) {
      throw new NotFoundException(error);
    }
  }

  async update(id: string, updateApplicationDto: UpdateApplicationDto) {
    try {
      const applied = await this.applicationRepository.findByIdAndUpdate(
        id,
        updateApplicationDto,
        {
          new: true,
        },
      );
      if (applied) {
        return {
          message: 'Applied updated successfully',
          data: applied,
        };
      }
    } catch (error) {
      throw new NotFoundException(error);
    }
  }

  async remove(data: DeleteApplicationDto) {
    const { ids } = data;
    console.log("data",data)
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
          return {
            message: 'Applied deleted successfully',
            data: [],
          };
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
          return {
            message: 'Applied deleted successfully',
            data: [],
          };
        } else {
          throw new NotFoundException();
        }
      } catch (error) {
        throw new NotFoundException(error);
      }
    }
  }
}
