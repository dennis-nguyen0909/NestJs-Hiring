import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateFollowDto } from './dto/create-follow.dto';
import { UpdateFollowDto } from './dto/update-follow.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Follow } from './schema/Follow.schema';
import { Model } from 'mongoose';
import { UsersService } from '../users/users.service';

@Injectable()
export class FollowService {
  constructor(
    @InjectModel(Follow.name) private readonly followModel: Model<Follow>,
    private readonly userService: UsersService,
  ) {}
  // Tạo một bản ghi theo dõi mới
  async create(createFollowDto: CreateFollowDto): Promise<Follow> {
    const { following_id, follower_id } = createFollowDto;

    // Kiểm tra xem người theo dõi và người được theo dõi có tồn tại không
    const following = await this.userService.findOne(following_id + '');
    const follower = await this.userService.findOne(follower_id + '');

    if (!following || !follower) {
      throw new BadRequestException('User not found');
    }

    // Kiểm tra xem đã có bản ghi theo dõi chưa
    const existingFollow = await this.followModel.findOne({
      following_id,
      follower_id,
    });

    if (existingFollow) {
      // Nếu đã theo dõi, xóa bản ghi để hủy theo dõi
      await this.followModel.findByIdAndDelete(existingFollow._id);
      console.log("hủy theo dõi")
      return existingFollow; // Trả về bản ghi đã bị xóa
    } else {
      // Nếu chưa theo dõi, tạo một bản ghi mới
      const newFollow = await this.followModel.create(createFollowDto);
      console.log("tạo theo dõi")
      if (!newFollow) {
        throw new BadRequestException('Create follow failed');
      }
      return newFollow;
    }
  }

  // Lấy tất cả các bản ghi theo dõi
  async findAll(): Promise<Follow[]> {
    return this.followModel.find().populate('following_id follower_id').exec(); // Lấy tất cả bản ghi và populate thông tin người theo dõi và công ty
  }

  // Tìm một bản ghi theo dõi theo ID
  async findOne(id: string): Promise<Follow> {
    return this.followModel
      .findById(id)
      .populate('following_id follower_id')
      .exec(); // Tìm bản ghi theo ID và populate
  }

  // Cập nhật một bản ghi theo dõi
  async update(id: string, updateFollowDto: UpdateFollowDto): Promise<Follow> {
    return this.followModel
      .findByIdAndUpdate(id, updateFollowDto, { new: true })
      .populate('following_id follower_id')
      .exec(); // Cập nhật bản ghi và trả về bản ghi mới
  }

  // Xóa một bản ghi theo dõi
  async remove(id: string): Promise<Follow> {
    const res = await this.followModel.findByIdAndDelete(id);
    if (!res) {
      throw new Error('Follow not found');
    }
    return res;
  }
}
