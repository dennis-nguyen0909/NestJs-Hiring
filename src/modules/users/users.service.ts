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
import { RoleService } from '../role/role.service';
import e from 'express';
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userRepository: Model<User>,
    private mailService: MailerService,
    private roleService: RoleService
  ) {}

  isEmailExists = async (email: string) => {
    const user = await this.userRepository.exists({ email });
    if (user) {
      return true;
    }
    return false;
  };

  async create(createUserDto: CreateUserDto) {
    const { email, password, role, company_name, website, location, description } = createUserDto;

    // Kiểm tra nếu email đã tồn tại
    const existingUser = await this.userRepository.findOne({ email });
    if (existingUser) {
      throw new BadRequestException('Email already exists.');
    }

    // Hash password trước khi lưu vào DB
    const hashedPassword = await hashPasswordHelper(password);
    const findRole = await this.roleService.findByRoleName(role);
    if(!findRole){
      throw new BadRequestException('Role not found. Please check if the role exists.');

    }
    const user = new this.userRepository({
      ...createUserDto,
      password: hashedPassword,
      role:findRole._id
    });

    // Phân biệt giữa User và Employer
    if (role === 'EMPLOYER') {
      if (!company_name || !website || !location) {
        throw new BadRequestException('Missing employer details: company_name, website, and location are required.');
      }
      user.company_name = company_name;
      user.website = website;
      user.location = location;
      user.description = description || '';
    }

    return user.save();
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
      .select('-password').populate('role');
    return {
      result,
      totalItems,
      totalPages,
    };
  }

  async findByEmail (email: string) {
    const user = await this.userRepository.findOne({ email });
    return user;
  }


  async findOne(id: string) {
        try {
        const user = await this.userRepository.findOne({_id:id});
        if(user){
          return user
        }
        return null;
      } catch (error) {
            throw new NotFoundException()
      }
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

    return {
      _id: newUser._id
    }
  }
}
