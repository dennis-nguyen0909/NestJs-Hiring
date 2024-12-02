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
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get('')
  @ResponseMessage('List of users')
  findAll(
    @Query() query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.usersService.findAll(query, +current, +pageSize);
  }
  @Get('/company')
  async getAllCompany(@Query('query') query:string,@Query('current') current:string ,@Query('pageSize') pageSize:string){
    return this.usersService.getAllCompany(query,+current,+pageSize)
  }

  @Get(':id')
  @ResponseMessage('Success')
  findOne(@Param('id') id: string) {
    return this.usersService.getDetailUser(id);
  }

  @Patch()
  @ResponseMessage('Success')
  update(@Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(updateUserDto);
  }

  @Delete(':id')
  @ResponseMessage('Success')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Post('reset-password')
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<string> {
    return this.usersService.resetPassword(resetPasswordDto);
  }

  @Get(':id/profile-completion')
  async getProfileCompletion(@Param('id') userId: string): Promise<number> {
    return this.usersService.calculateProfileCompletion(userId);
  }
}
