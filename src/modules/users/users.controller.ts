import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public, ResponseMessage } from 'src/decorator/customize';
import { ApiTags } from '@nestjs/swagger';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { User } from './schemas/user.schema';
import { Meta } from '../types';
import { query, Request } from 'express';

@Controller('users')
@ApiTags('Users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('create')
  @ResponseMessage('Create user successfully')
  // eslint-disable-next-line prettier/prettier
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return await this.usersService.create(createUserDto);
  }

  @Get('')
  @ResponseMessage('List of users')
  async findAll(
    @Query('query') query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ): Promise<{ items: User[]; meta: Meta }> {
    return await this.usersService.findAll(query, +current, +pageSize);
  }

  @Get('/company')
  @Public()
  async getAllCompany(
    @Query('query') query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ): Promise<{ items: User[]; meta: Meta }> {
    return this.usersService.getAllCompany(query, +current, +pageSize);
  }

  @Get(':id')
  @ResponseMessage('Success')
  async getDetailUser(@Param('id') id: string): Promise<{ items: User }> {
    return await this.usersService.getDetailUser(id);
  }

  @Patch()
  // @Public()
  @ResponseMessage('Success')
  async update(
    @Body() updateUserDto: UpdateUserDto,
    @Req() request: Request,
  ): Promise<Partial<User>> {
    return await this.usersService.update(updateUserDto, request);
  }
  @Delete('delete-avatar')
  async deleteAvatarCompany(
    @Body('type') type: string,
    @Body('user_id') userId: string,
  ): Promise<[]> {
    return await this.usersService.removeAvatarEmployer(type, userId);
  }

  @Delete(':id')
  @ResponseMessage('Success')
  async remove(@Param('id') id: string) {
    return await this.usersService.remove(id);
  }

  @Post('reset-password')
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<string> {
    return await this.usersService.resetPassword(resetPasswordDto);
  }

  @Get(':id/profile-completion')
  async getProfileCompletion(@Param('id') userId: string): Promise<number> {
    return await this.usersService.calculateProfileCompletion(userId);
  }

  @Post('send-application-email')
  @ResponseMessage('Success')
  async sendJobApplicationEmail(@Body() body: any) {
    return await this.usersService.employerSendMail(body);
  }

  @Get('check-update-company/:user_id')
  async checkAndUpdateProgressSetupCompany(@Param('user_id') userId: string) {
    return await this.usersService.checkAndUpdateProgressSetupCompany(userId);
  }

  @Get('profile/:id')
  async getProfileCandidate(
    @Param('id') userId: string,
    @Req() req,
  ): Promise<{ items: User }> {
    const employerId = req?.user?._id;
    return await this.usersService.getProfileCandidate(userId, employerId);
  }

  @Post('validate-facebook')
  @ResponseMessage('Success')
  @Public()
  async validateFacebook(@Body() body: any) {
    return await this.usersService.validateFacebookUser(body);
  }

  @Get('get-viewed-jobs/:id')
  @ResponseMessage('Success')
  async getViewedJobs(
    @Param('id') userId: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
    @Query('query') query: string,
  ) {
    return await this.usersService.getViewedJobs(
      userId,
      query,
      +current,
      +pageSize,
    );
  }

  @Get('count-viewed-jobs/:id')
  @ResponseMessage('Success')
  async countViewedJobs(@Param('id') userId: string): Promise<number> {
    return await this.usersService.countViewedJobs(userId);
  }
}
