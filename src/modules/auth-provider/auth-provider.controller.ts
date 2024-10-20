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

@Controller('auth-providers')
@ApiTags('AuthProvider')
@Public()
export class AuthProviderController {
  constructor(private readonly authProviderService: AuthProviderService) {}

  @Post()
  @ResponseMessage('Success')
  create(@Body() createAuthProviderDto: CreateAuthProviderDto) {
    return this.authProviderService.create(createAuthProviderDto);
  }

  @Get()
  @ResponseMessage('Success')
  findAll(
    @Query() query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.authProviderService.findAll(query, +current, +pageSize);
  }

  @Get(':id')
  @ResponseMessage('Success')
  findOne(@Param('id') id: string) {
    return this.authProviderService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Success')
  update(
    @Param('id') id: string,
    @Body() updateAuthProviderDto: UpdateAuthProviderDto,
  ) {
    return this.authProviderService.update(id, updateAuthProviderDto);
  }

  @Delete()
  @ResponseMessage('Success')
  remove(@Body() data: DeleteAuthProviderDTO) {
    return this.authProviderService.remove(data);
  }
}
