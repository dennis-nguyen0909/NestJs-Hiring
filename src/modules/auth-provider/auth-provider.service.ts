import { Injectable } from '@nestjs/common';
import { CreateAuthProviderDto } from './dto/create-auth-provider.dto';
import { UpdateAuthProviderDto } from './dto/update-auth-provider.dto';

@Injectable()
export class AuthProviderService {
  create(createAuthProviderDto: CreateAuthProviderDto) {
    return 'This action adds a new authProvider';
  }

  findAll() {
    return `This action returns all authProvider`;
  }

  findOne(id: number) {
    return `This action returns a #${id} authProvider`;
  }

  update(id: number, updateAuthProviderDto: UpdateAuthProviderDto) {
    return `This action updates a #${id} authProvider`;
  }

  remove(id: number) {
    return `This action removes a #${id} authProvider`;
  }
}
