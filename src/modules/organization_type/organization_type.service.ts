import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import aqp from 'api-query-params';
import { OrganizationType } from './schema/organization_type.schema';
import { CreateOrganizationTypeDto } from './dto/create-organization_type.dto';
import { UpdateOrganizationTypeDto } from './dto/update-organization_type.dto';

@Injectable()
export class OrganizationTypeService {
  constructor(
    @InjectModel(OrganizationType.name)
    private readonly organizationTypeModel: Model<OrganizationType>,
  ) {}
  async create(createJobType: CreateOrganizationTypeDto) {
    const response = await this.organizationTypeModel.create(createJobType);
    if (!response) {
      throw new BadRequestException('Failed');
    }
    return response;
  }

  async findAll(query: string, current: number, pageSize: number) {
    const { filter, sort } = aqp(query);
    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;
    if (!current) current = 1;
    if (!pageSize) pageSize = 10;
    const totalItems = (await this.organizationTypeModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (+current - 1) * pageSize;
    const result = await this.organizationTypeModel
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

  async findOne(id: string) {
    const response = await this.organizationTypeModel.findOne({ _id: id });
    if (!response) {
      throw new NotFoundException();
    }
    return response;
  }

  async update(id: string, updateDto: UpdateOrganizationTypeDto) {
    const response = await this.organizationTypeModel.findByIdAndUpdate(
      id,
      updateDto,
      {
        new: true,
        runValidators: true,
      },
    );
    if (!response) {
      throw new NotFoundException();
    }
    return response;
  }

  async remove(ids: Array<string>) {
    try {
      if (ids.length < 0) {
        throw new BadRequestException('Ids not found');
      }
      if (!Array.isArray(ids)) {
        throw new BadRequestException('Ids phai la mang');
      }
      if (ids.length === 1) {
        const response = await this.organizationTypeModel.findById(ids[0]);
        if (!response) {
          throw new NotFoundException();
        }
        const result = await this.organizationTypeModel.deleteOne({
          _id: ids[0],
        });
        if (result.deletedCount > 0) {
          return [];
        } else {
          throw new BadRequestException('Delete failed!');
        }
      } else {
        const response = await this.organizationTypeModel.find({
          _id: { $in: ids },
        });
        if (!response) {
          throw new NotFoundException();
        }
        const result = await this.organizationTypeModel.deleteMany({
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
}
