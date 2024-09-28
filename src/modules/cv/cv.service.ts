import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CV } from './schema/CV.schema';
import aqp from 'api-query-params';
import { DeleteCvDto } from './dto/delete-cv.dto';

@Injectable()
export class CvService {
  constructor(@InjectModel('CV') private cvRepository: Model<CV>) {}
  async create(createCvDto: CreateCvDto) {
    const {
      title,
      user_id,
      personal_info,
      education,
      work_experience,
      skills,
      languages,
      cv_url,
      file_name,
    } = createCvDto;
    const cv = await this.cvRepository.create({
      title,
      user_id,
      personal_info,
      education,
      work_experience,
      skills,
      languages,
      cv_url,
      file_name,
    });
    return {
      message: 'Cv created successfully',
      data: cv,
    };
  }

  async findAll(query: string, current: number, pageSize: number) {
    const { filter, sort } = aqp(query);
    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;
    if (!current) current = 1;
    if (!pageSize) pageSize = 10;
    const defaultSort = '-createdAt';
    const sortOption = sort || defaultSort;
    const totalItems = (await this.cvRepository.find(filter)).length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (+current - 1) * pageSize;
    const result = await this.cvRepository
      .find(filter)
      .limit(pageSize)
      .skip(skip)
      .sort(sortOption as any);
    return {
      data: {
        item: result,
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
    return await this.cvRepository.findById(id);
  }

  async update(id: string, updateCvDto: UpdateCvDto) {
    try {
      const cv = await this.cvRepository.findByIdAndUpdate(id, updateCvDto, {
        new: true,
      });
      if (cv) {
        return {
          message: 'Cv updated successfully',
          data: cv,
        };
      }
    } catch (error) {
      throw new NotFoundException(error);
    }
  }

  async remove(data: DeleteCvDto) {
    const { ids } = data;
    if (!Array.isArray(ids)) {
      throw new BadRequestException('Ids not is array');
    }
    if (ids.length < 0) {
      throw new BadRequestException('Ids not found');
    }
    if (ids.length === 1) {
      const res = await this.cvRepository.deleteOne({ _id: ids[0] });
      if (res.deletedCount > 0) {
        return {
          message: 'Cv deleted successfully',
          data: [],
        };
      } else {
        return {
          message: 'Cv not found',
          data: [],
        };
      }
    } else {
      const res = await this.cvRepository.deleteMany({ _id: { $in: ids } });
      if (res.deletedCount > 0) {
        return {
          message: 'Cv deleted successfully',
          data: [],
        };
      } else {
        return {
          message: 'Cv not found',
          data: [],
        };
      }
    }
  }
  async findCvByUserId(
    id: string,
    query: string,
    current: number,
    pageSize: number,
  ) {
    const { filter, sort } = aqp(query);
    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;

    if (!current) current = 1;
    if (!pageSize) pageSize = 10;
    const totalItems = (await this.cvRepository.find({ user_id: id })).length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (+current - 1) * pageSize;
    const result = await this.cvRepository
      .find({ user_id: id })
      .limit(pageSize)
      .skip(skip)
      .sort(sort as any);
    return {
      data: {
        item: result,
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
}
