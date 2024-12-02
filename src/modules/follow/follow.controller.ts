import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { FollowService } from './follow.service';
import { CreateFollowDto } from './dto/create-follow.dto';
import { ApiTags } from '@nestjs/swagger';
@Controller('follows')
@ApiTags('Follow')
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @Post()
  async followUser(@Body() createFollowDto: CreateFollowDto) {
    return await this.followService.followUser(createFollowDto);
  }

  @Get(':id')
  async getFollows(@Param('id') id: string) {
    return await this.followService.getFollowByUserId(id);
  }
  // API để kiểm tra xem user có follow nhà tuyển dụng không
  @Get('check/:followerId/:employerId')
  async checkIfFollowing(
    @Param('followerId') followerId: string,
    @Param('employerId') employerId: string,
  ) {
    return await this.followService.checkIfFollowing(followerId, employerId);
  }
}
