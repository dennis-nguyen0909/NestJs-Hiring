import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  Request,
  UseGuards,
  Delete,
  Req,
} from '@nestjs/common';
import { EducationService } from './education.service';
import { UpdateEducationDto } from './dto/update-education.dto';
import { ApiTags } from '@nestjs/swagger';
import { Education } from './schema/Education.schema';
import { Public, ResponseMessage } from 'src/decorator/customize';
import { JwtAuthGuard } from '../auth/passport/jwt-auth-guard';
@Controller('educations')
@ApiTags('Education')
// @Public()
export class EducationController {
  constructor(private readonly educationService: EducationService) {}
  @Post('')
  @ResponseMessage('Add education successfully')
  @UseGuards(JwtAuthGuard)
  async addEducation(
    @Body() updateEducationDto: UpdateEducationDto,
    @Request() req,
  ): Promise<Education> {
    return this.educationService.addEducation(req.user._id, updateEducationDto);
  }

  // Lấy danh sách giáo dục của một người dùng
  @Get('user')
  @ResponseMessage('Success')
  async getEducations(@Request() req): Promise<Education[]> {
    return this.educationService.findEducationsByUserId(req.user._id);
  }

  @Get('')
  @Public()
  @ResponseMessage('Success')
  async getAll(
    @Query('query') query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ): Promise<any> {
    return this.educationService.findAll(query, +current, +pageSize);
  }

  @Patch(':id')
  @ResponseMessage('Success')
  @UseGuards(JwtAuthGuard)
  async updateByUserId(
    @Param('id') id: string,
    @Body() updateEducationDto: UpdateEducationDto,
    @Request() req,
  ): Promise<Education> {
    return this.educationService.updateByUserId(
      id,
      updateEducationDto,
      req.user._id,
    );
  }

  @Delete(':id')
  @ResponseMessage('Success')
  @UseGuards(JwtAuthGuard)
  async deleteByUserId(@Param('id') id: string, @Request() req) {
    return this.educationService.deleteByUserId(id, req.user._id);
  }

  @Get(':id')
  @ResponseMessage('Success')
  async findOne(@Param('id') id: string): Promise<Education> {
    return this.educationService.findOne(id);
  }
}
