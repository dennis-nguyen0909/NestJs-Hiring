import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/User.schema';
import { Model } from 'mongoose';
import { hashPasswordHelper } from 'src/helpers/util';
import aqp from 'api-query-params';
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userRepository: Model<User>,
  ) {}

  isEmailExists = async (email: string) => {
    const user = await this.userRepository.exists({ email });
    if (user) {
      return true;
    }
    return false;
  };

  async create(createUserDto: CreateUserDto) {
    const { full_name, email, password } = createUserDto;
    // check email
    const isEmailExists = await this.isEmailExists(email);
    if (isEmailExists) {
      throw new BadRequestException(`Email {${email}} already exists`);
    }
    // hash password
    const hashPassword = await hashPasswordHelper(password);
    const user = await this.userRepository.create({
      full_name,
      email,
      password: hashPassword,
    });
    return {
      _id: user._id,
    };
  }

  async findAll(query: string, current: number, pageSize: number) {
    const { filter, sort } = aqp(query);
    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;
    // check NaN
    if (!current) current = 1;
    if (!pageSize) pageSize = 10;
    // pagination
    const totalItems = (await this.userRepository.find(filter)).length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (+current - 1) * pageSize;

    const result = await this.userRepository
      .find(filter)
      .limit(pageSize)
      .skip(skip)
      .sort(sort as any)
      .select('-password');
    return {
      result,
      totalPages,
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
