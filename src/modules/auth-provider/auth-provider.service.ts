import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAuthProviderDto } from './dto/create-auth-provider.dto';
import { UpdateAuthProviderDto } from './dto/update-auth-provider.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthProvider } from './schema/AuthProvider.schema';
import aqp from 'api-query-params';
import { DeleteAuthProviderDTO } from './dto/delete-auth-provider.dto';

@Injectable()
export class AuthProviderService {
  constructor(
    @InjectModel('AuthProvider')
    private authProviderRepository: Model<AuthProvider>,
  ) {}
  async create(createAuthProviderDto: CreateAuthProviderDto) {
    const { provider_name, provider_id } = createAuthProviderDto;
    const findAP = await this.authProviderRepository.findOne({
      provider_name,
      provider_id,
    });
    if (findAP) {
      throw new BadRequestException('AuthProvider is exists!');
    }
    const newAuthProvider = await this.authProviderRepository.create({
      provider_id,
      provider_name,
    });
    return {
      message: 'AuthProvider created successfully',
      data: newAuthProvider,
    };
  }

  async findAll(query: string, current: number, pageSize: number) {
    const { filter, sort } = aqp(query);
    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;
    if (!current) current = 1;
    if (!pageSize) pageSize = 10;
    const totalItems = (await this.authProviderRepository.find(filter)).length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (+current - 1) * pageSize;
    const result = await this.authProviderRepository
      .find(filter)
      .limit(pageSize)
      .skip(skip)
      .sort(sort as any);
    return {
      data: {
        item: result,
        meta: {
          count: result.length,
          current_page: current,
          per_page: pageSize,
          total: totalItems,
          total_pages: totalPages,
        },
      },
    };
  }

  async findOne(id: string) {
    const result = await this.authProviderRepository.findOne({ _id: id });
    return {
      message: 'This action returns authProvider',
      data: result,
    };
  }

  async update(id: string, updateAuthProviderDto: UpdateAuthProviderDto) {
    const result = await this.authProviderRepository.updateOne(
      { _id: id },
      updateAuthProviderDto,
    );
    if (result.modifiedCount === 0) {
      throw new BadRequestException('AuthProvider not found');
    }
    return {
      message: 'AuthProvider updated successfully',
      data: updateAuthProviderDto,
    };
  }

  async remove(data: DeleteAuthProviderDTO) {
    const { ids } = data;
    console.log("duydeptrai",ids)
    try {
      if (!Array.isArray(ids)) {
        throw new BadRequestException('Ids not is array');
      }
      if (ids.length < 0) {
        throw new BadRequestException('Ids not found');
      }
      if (ids.length === 1) {
        await this.authProviderRepository.deleteOne({ _id: ids[0] });
        return {
          message: 'AuthProvider deleted successfully',
          data: [],
        };
      } else {
        await this.authProviderRepository.deleteMany({
          _id: { $in: ids },
        });
        return {
          message: 'AuthProvider deleted successfully',
          data: [],
        };
      }
    } catch (error) {
      throw new NotFoundException(error);
    }
  }
}
