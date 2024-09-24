import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthProviderService } from './auth-provider.service';
import { CreateAuthProviderDto } from './dto/create-auth-provider.dto';
import { UpdateAuthProviderDto } from './dto/update-auth-provider.dto';

@Controller('auth-provider')
export class AuthProviderController {
  constructor(private readonly authProviderService: AuthProviderService) {}

  @Post()
  create(@Body() createAuthProviderDto: CreateAuthProviderDto) {
    return this.authProviderService.create(createAuthProviderDto);
  }

  @Get()
  findAll() {
    return this.authProviderService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authProviderService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAuthProviderDto: UpdateAuthProviderDto) {
    return this.authProviderService.update(+id, updateAuthProviderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authProviderService.remove(+id);
  }
}
