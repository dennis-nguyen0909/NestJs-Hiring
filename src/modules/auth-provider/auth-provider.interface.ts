import { CreateAuthProviderDto } from './dto/create-auth-provider.dto';
import { UpdateAuthProviderDto } from './dto/update-auth-provider.dto';
import { DeleteAuthProviderDTO } from './dto/delete-auth-provider.dto';
import { AuthProvider } from './schema/AuthProvider.schema';
import { Meta } from '../types';

export interface AuthProviderServiceInterface {
  create(createAuthProviderDto: CreateAuthProviderDto): Promise<AuthProvider>;
  findAll(
    query: string,
    current: number,
    pageSize: number,
  ): Promise<{
    items: AuthProvider[];
    meta: Meta;
  }>;
  findOne(id: string): Promise<AuthProvider>;
  findDynamic(filter: Record<string, any>): Promise<AuthProvider>;
  update(
    id: string,
    updateAuthProviderDto: UpdateAuthProviderDto,
  ): Promise<UpdateAuthProviderDto>;
  remove(data: DeleteAuthProviderDTO): Promise<[]>;
}
