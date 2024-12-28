import { CreateFollowDto } from './dto/create-follow.dto';
import { Follow } from './schema/Follow.schema';

export interface IFollowService {
  followUser(
    createFollowDto: CreateFollowDto,
  ): Promise<{ message: string; status: string }>;
  getFollowByUserId(id: string): Promise<Follow[]>;
  checkIfFollowing(
    followerId: string,
    employerId: string,
  ): Promise<{ isFollowing: boolean }>;
}
