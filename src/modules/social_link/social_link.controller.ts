import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Request,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from 'src/decorator/customize';
import { CreateSocialLinkDto } from './dto/create-social_link.dto';
import { SocialLinkService } from './social_link.service';
import { UpdateSocialLinkDto } from './dto/update-social_link.dto';
import { DeleteSocialLink } from './dto/delete-skill.dto';

@Controller('social-links')
export class SocialLinkController {
  constructor(private readonly socialLinkService: SocialLinkService) {}

  @Post()
  @ResponseMessage('Success')
  async create(@Body() createData: CreateSocialLinkDto) {
    return await this.socialLinkService.create(createData);
  }

  @Get()
  @ResponseMessage('Success')
  async findAll(
    @Query() query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return await this.socialLinkService.findAll(query, +current, +pageSize);
  }

  @Get('user')
  @ResponseMessage('Success')
  async getSkillsByUserId(
    @Request() req,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
    @Query('query') query: string,
  ) {
    return await this.socialLinkService.getSkillsByUserId(
      req.user._id,
      +current,
      +pageSize,
      query,
    );
  }

  @Get(':id')
  @ResponseMessage('Success')
  async findOne(@Param('id') id: string) {
    return await this.socialLinkService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Success')
  async update(
    @Param('id') id: string,
    @Body() UpdateSkillEmployerDto: UpdateSocialLinkDto,
  ) {
    return await this.socialLinkService.update(id, UpdateSkillEmployerDto);
  }

  @Delete()
  @ResponseMessage('Success')
  async remove(@Body() data: DeleteSocialLink) {
    return await this.socialLinkService.remove(data);
  }

  @Delete(':id')
  @ResponseMessage('Success')
  async deleteByUserId(@Param('id') id: string, @Request() req) {
    return await this.socialLinkService.deleteByUserId(id, req.user._id);
  }
}
