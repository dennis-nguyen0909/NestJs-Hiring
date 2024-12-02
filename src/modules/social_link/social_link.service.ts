import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import aqp from 'api-query-params';
import { SocialLink } from './schema/social_link.schema';
import { CreateSocialLinkDto } from './dto/create-social_link.dto';
import { DeleteSocialLink } from './dto/delete-skill.dto';
import { UpdateSocialLinkDto } from './dto/update-social_link.dto';
import { User } from '../users/schemas/User.schema';

@Injectable()
export class SocialLinkService {
  constructor(
    @InjectModel(SocialLink.name)
    private socialLinkModel: Model<SocialLink>,
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}
  async create(data: CreateSocialLinkDto) {
    try {
      const user = await this.userModel.findById(data?.user_id);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const createSocial = await this.socialLinkModel.create(data);
      if (!createSocial) {
        throw new BadRequestException('Create failed!');
      }
      await this.userModel.findOneAndUpdate(
        { _id: data.user_id },
        { $push: { social_links: createSocial._id } },
        { new: true },
      );
      return createSocial;
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

    const totalItems = (await this.socialLinkModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (+current - 1) * pageSize;
    const result = await this.socialLinkModel
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
    const skill = this.socialLinkModel.findOne({ _id: id });
    if (!skill) {
      throw new NotFoundException();
    }
    return skill;
  }

  update(id: string, update: UpdateSocialLinkDto) {
    const skill = this.socialLinkModel.updateOne({ _id: id }, update);
    if (!skill) {
      throw new NotFoundException();
    }
    return skill;
  }

  async remove(data: DeleteSocialLink) {
    const { ids } = data;
    try {
      if (!Array.isArray(ids) || ids.length < 0) {
        throw new NotFoundException('Ids not found');
      }
      if (ids.length === 1) {
        const checkNotExists = await this.socialLinkModel.findOne({
          _id: ids[0],
        });
        if (!checkNotExists) {
          throw new NotFoundException('Ids not found');
        }
        const result = await this.socialLinkModel.deleteOne({ _id: ids[0] });
        if (result.deletedCount > 0) {
          return [];
        } else {
          throw new BadRequestException('Delete failed');
        }
      } else {
        const checkNotExists = await this.socialLinkModel.findOne({
          _id: { $in: ids },
        });
        if (!checkNotExists) {
          throw new NotFoundException('Ids not found');
        }
        const result = await this.socialLinkModel.deleteMany({
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
  async getSkillsByUserId(
    userId: string,
    current: number,
    pageSize: number,
    query: string,
  ) {
    try {
      // Xử lý bộ lọc và sắp xếp từ query
      const { filter, sort } = aqp(query);
      if (filter.current) delete filter.current;
      if (filter.pageSize) delete filter.pageSize;

      if (!current) current = 1;
      if (!pageSize) pageSize = 10;
      // Lọc theo userId
      filter.user_id = userId;

      // Xóa các tham số phân trang từ filter nếu có
      if (filter.current) delete filter.current;
      if (filter.pageSize) delete filter.pageSize;
      // Tính tổng số mục
      const totalItems = (await this.socialLinkModel.find(filter)).length;

      // Tính tổng số trang
      const totalPages = Math.ceil(totalItems / pageSize);
      // Tính số mục cần bỏ qua
      const skip = (current - 1) * pageSize;

      // Truy vấn dữ liệu với phân trang và sắp xếp
      const result = await this.socialLinkModel
        .find(filter)
        .limit(pageSize)
        .skip(skip)
        .sort(sort as any);

      // Nếu không tìm thấy kết quả
      if (!result.length) {
        throw new NotFoundException('Not found!');
      }

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
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  async deleteByUserId(id: string, userId: string): Promise<any> {
    const education = await this.socialLinkModel.findById({
      _id: id,
    });
    if (education == null) {
      throw new BadRequestException('Không tìm thấy dữ liệu');
    }
    if (education.user_id + '' !== userId) {
      throw new BadRequestException('Không có quyền cập nhật');
    }

    // Xóa Education trong bảng Education
    const res = await this.socialLinkModel.deleteOne({ _id: id });

    // Xóa ObjectId khỏi mảng education_ids trong bảng User
    await this.userModel.updateOne(
      { _id: userId },
      { $pull: { social_links: new Types.ObjectId(id) } }, // $pull để xóa ObjectId khỏi mảng
    );

    if (res.deletedCount > 0) {
      return [];
    } else {
      throw new BadRequestException('Xóa không thành công');
    }
  }
}
