import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateFollowDto } from './dto/create-follow.dto';
import { UpdateFollowDto } from './dto/update-follow.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Follow } from './schema/Follow.schema';
import { Model, Types } from 'mongoose';
import { UsersService } from '../users/users.service';

@Injectable()
export class FollowService {
  constructor(
    @InjectModel(Follow.name) private readonly followModel: Model<Follow>,
    private readonly userService: UsersService,
  ) {}
  async followUser(createFollowDto: CreateFollowDto) {
    const { follower_id, following_id } = createFollowDto;
    const follower = await this.userService.findByObjectId(follower_id + '');
    const following = await this.userService.findByObjectId(following_id + '');

    if (follower_id === following_id) {
      throw new BadRequestException('You cannot follow yourself');
    }
    if (
      follower.role.role_name === 'ADMIN' ||
      following.role.role_name === 'ADMIN'
    ) {
      throw new BadRequestException('You cannot follow admin');
    }
    if (
      follower.role.role_name === 'EMPLOYER' &&
      following.role.role_name === 'EMPLOYER'
    ) {
      throw new BadRequestException('You cannot follow employer');
    }
    if (
      follower.role.role_name === 'USER' &&
      following.role.role_name === 'USER'
    ) {
      throw new BadRequestException('You cannot follow user');
    }
    if (!follower || !following) {
      throw new NotFoundException('One or both users not found');
    }

    const existingFollow = await this.followModel.findOne({
      follower_id: follower_id,
      following_id: following_id,
    });

    if (existingFollow) {
      const res = await this.followModel.deleteOne({ _id: existingFollow._id });
      if (res.deletedCount > 0) {
        return 'Unfollowed successfully';
      }
    } else {
      const follow = new this.followModel({
        follower_id: follower_id,
        following_id: following_id,
      });
      await follow.save();
      return 'Followed successfully';
    }
  }
  async getFollowByUserId(id: string) {
    return await this.followModel.find({ follower_id: id });
  }
  // Phương thức kiểm tra xem user có đang follow nhà tuyển dụng hay không
  async checkIfFollowing(followerId: string, employerId: string) {
    // Tìm thông tin người theo dõi
    const follower = await this.userService.findByObjectId(followerId + '');
    const employer = await this.userService.findByObjectId(employerId + '');

    // Kiểm tra xem người dùng và nhà tuyển dụng có tồn tại không
    if (!follower || !employer) {
      throw new NotFoundException('User or Employer not found');
    }

    // Kiểm tra xem vai trò của employer có phải là EMPLOYER không
    if (employer.role.role_name !== 'EMPLOYER') {
      throw new BadRequestException('The target user is not an Employer');
    }

    // Kiểm tra xem follower có đang follow employer không
    const followRecord = await this.followModel.findOne({
      follower_id: followerId,
      following_id: employerId,
    });

    // Trả về kết quả true nếu đã follow, false nếu chưa follow
    return followRecord ? { isFollowing: true } : { isFollowing: false };
  }
}
