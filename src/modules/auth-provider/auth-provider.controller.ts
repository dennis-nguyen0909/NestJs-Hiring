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
import { AuthProviderService } from './auth-provider.service';
import { CreateAuthProviderDto } from './dto/create-auth-provider.dto';
import { UpdateAuthProviderDto } from './dto/update-auth-provider.dto';
import { ApiTags } from '@nestjs/swagger';
import { Public, ResponseMessage } from 'src/decorator/customize';
import { DeleteAuthProviderDTO } from './dto/delete-auth-provider.dto';
import { AuthProvider } from './schema/AuthProvider.schema';
import { Meta } from '../types';

@Controller('auth-providers')
@ApiTags('AuthProvider')
@Public()
export class AuthProviderController {
  constructor(private readonly authProviderService: AuthProviderService) {}

  @Post()
  @ResponseMessage('Success')
  async create(
    @Body() createAuthProviderDto: CreateAuthProviderDto,
  ): Promise<AuthProvider> {
    return await this.authProviderService.create(createAuthProviderDto);
  }

  @Get()
  @ResponseMessage('Success')
  async findAll(
    @Query() query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ): Promise<{
    items: AuthProvider[];
    meta: Meta;
  }> {
    return await this.authProviderService.findAll(query, +current, +pageSize);
  }

  @Get(':id')
  @ResponseMessage('Success')
  async findOne(@Param('id') id: string): Promise<AuthProvider> {
    return await this.authProviderService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Success')
  async update(
    @Param('id') id: string,
    @Body() updateAuthProviderDto: UpdateAuthProviderDto,
  ): Promise<UpdateAuthProviderDto> {
    return await this.authProviderService.update(id, updateAuthProviderDto);
  }

  @Delete()
  @ResponseMessage('Success')
  async remove(@Body() data: DeleteAuthProviderDTO): Promise<[]> {
    return await this.authProviderService.remove(data);
  }
}
