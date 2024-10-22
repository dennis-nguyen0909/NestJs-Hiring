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
import { UsersService } from '../users/users.service';
@Controller('follow')
@ApiTags('Follow')
@Public()
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  // Tạo một bản ghi theo dõi mới
  @Post()
  create(@Body() createFollowDto: CreateFollowDto) {
    return this.followService.create(createFollowDto);
  }

  // Lấy tất cả các bản ghi theo dõi
  @Get()
  findAll() {
    return this.followService.findAll();
  }

  // Tìm một bản ghi theo dõi theo ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.followService.findOne(id);
  }

  // Cập nhật một bản ghi theo dõi
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFollowDto: UpdateFollowDto) {
    return this.followService.update(id, updateFollowDto);
  }

  // Xóa một bản ghi theo dõi
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.followService.remove(id);
  }

  // // Kiểm tra xem ứng viên đã theo dõi công ty chưa
  // @Get('is-following')
  // async isFollowing(
  //   @Query('candidateId') candidateId: string,
  //   @Query('companyId') companyId: string,
  // ): Promise<{ isFollowing: boolean }> {
  //   const result = await this.followService.isFollowing(candidateId, companyId);
  //   return { isFollowing: result };
  // }

  // // Đếm số lượng công ty mà ứng viên đã theo dõi
  // @Get('count-followed-companies')
  // async countFollowedCompanies(
  //   @Query('candidateId') candidateId: string,
  // ): Promise<{ count: number }> {
  //   const count = await this.followService.countFollowedCompanies(candidateId);
  //   return { count }; // Trả về số lượng công ty mà ứng viên đã theo dõi
  // }
}
