/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/User.schema';
import { Model } from 'mongoose';
import { hashPasswordHelper } from 'src/helpers/util';
import aqp from 'api-query-params';
import mongoose from 'mongoose';
import { RegisterAuthDto } from '../auth/dto/register-auth.dto';
import {v4 as uuidv4} from 'uuid';
import * as dayjs from 'dayjs';
import { MailerService } from '@nestjs-modules/mailer';
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userRepository: Model<User>,
    private mailService: MailerService,
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

  async findByEmail (email: string) {
    const user = await this.userRepository.findOne({ email });
    return user;
  }


  findOne(id: number) {
    console.log('id', id);
    return `This action returns a #${id} user`;
  }

  async update(updateUserDto: UpdateUserDto) {
    const updatedUser = await this.userRepository.findOneAndUpdate(
      { _id: updateUserDto._id },
      { $set: updateUserDto },
      { new: true }
    );
  
    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }
  
    // Loại bỏ trường password trước khi trả về
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = updatedUser.toObject();
  
    return {
      message: 'User updated successfully',
      data: userWithoutPassword,
    };
  }
  
  

  async remove(id: string) {
    console.log("id", id);
    
    // Kiểm tra xem id có phải là ObjectId hợp lệ không
    if (!mongoose.isValidObjectId(id)) {
      throw new BadRequestException("Id không đúng định dạng");
    }
  
    // Thực hiện xóa người dùng theo id
    const result = await this.userRepository.deleteOne({ _id: id });
  
    // Kiểm tra kết quả của việc xóa
    if (result.deletedCount === 0) {
      throw new NotFoundException("Không tìm thấy người dùng với id này");
    }
  
    // Nếu xóa thành công, trả về message
    return {
      message: 'Người dùng đã được xóa thành công',
      id: id,
    };
  }

  async handleRegister(registerDto: RegisterAuthDto) {
    const {email ,password, full_name} = registerDto;
    const isEmailExists = await this.isEmailExists(email);

    if(isEmailExists){
      throw new BadRequestException(`Email {${email}} already exists`);
    }

    const hashPassword = await hashPasswordHelper(password);
    const codeId =uuidv4()
    const newUser = await this.userRepository.create({
      full_name,email,password:hashPassword,
      is_active:false,
      code_id: codeId,
      // code_expired: dayjs().add(5, 'minute')
      code_expired: dayjs().add(30, 's')
    })
    // send mail
    console.log("newUser", newUser);
      this.mailService.sendMail({
        to: newUser.email, // list of receivers
        subject: 'Kích hoạt tài khoản tại @dennis', // Subject line
        text: 'Chào mừng', // plaintext body
        template: 'template',
        context: {
          name: newUser?.full_name ?? newUser.email,
          activationCode: codeId,
        },
      });
      console.log("newUser2", newUser);

    return {
      _id: newUser._id
    }
  }
}
