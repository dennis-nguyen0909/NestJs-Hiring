import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { FollowService } from './follow.service';
import { CreateFollowDto } from './dto/create-follow.dto';
import { ApiTags } from '@nestjs/swagger';
import { Follow } from './schema/Follow.schema';
@Controller('follows')
@ApiTags('Follow')
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @Post()
  async followUser(
    @Body() createFollowDto: CreateFollowDto,
  ): Promise<{ message: string; status: string }> {
    return await this.followService.followUser(createFollowDto);
  }

  @Get(':id')
  async getFollows(@Param('id') id: string): Promise<Follow[]> {
    return await this.followService.getFollowByUserId(id);
  }
  // API để kiểm tra xem user có follow nhà tuyển dụng không
  @Get('check/:followerId/:employerId')
  async checkIfFollowing(
    @Param('followerId') followerId: string,
    @Param('employerId') employerId: string,
  ): Promise<{ isFollowing: boolean }> {
    return await this.followService.checkIfFollowing(followerId, employerId);
  }
}
