import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { FollowService } from './follow.service';
import { CreateFollowDto } from './dto/create-follow.dto';
import { UpdateFollowDto } from './dto/update-follow.dto';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/decorator/customize';
@Controller('follows')
@ApiTags('Follow')
@Public()
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @Post()
  followUser(@Body() createFollowDto: CreateFollowDto) {
    return this.followService.followUser(createFollowDto);
  }

  @Get(':id')
  getFollows(@Param('id') id: string) {
    return this.followService.getFollowByUserId(id);
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
