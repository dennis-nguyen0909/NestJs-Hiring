/* eslint-disable prettier/prettier */
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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public, ResponseMessage } from 'src/decorator/customize';
import { ApiTags } from '@nestjs/swagger';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { query } from 'express';

@Controller('users')
@Public()
@ApiTags('Users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('create')
  @ResponseMessage('Create user successfully')
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  @Get('')
  @ResponseMessage('List of users')
  async findAll(
    @Query() query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return await this.usersService.findAll(query, +current, +pageSize);
  }
  @Get('/company')
  async getAllCompany(
    @Query('query') query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.usersService.getAllCompany(query, +current, +pageSize);
  }

  @Get(':id')
  @ResponseMessage('Success')
  async findOne(@Param('id') id: string) {
    return await this.usersService.getDetailUser(id);
  }

  @Patch()
  @ResponseMessage('Success')
  async update(@Body() updateUserDto: UpdateUserDto) {
    return await this.usersService.update(updateUserDto);
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
}
