/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/User.schema';
import { Model, Types } from 'mongoose';
import { comparePasswordHelper, emailRegex, hashPasswordHelper, passwordRegex } from 'src/helpers/util';
import aqp from 'api-query-params';
import mongoose from 'mongoose';
import { RegisterAuthDto } from '../auth/dto/register-auth.dto';
import { v4 as uuidv4 } from 'uuid';
import * as dayjs from 'dayjs';
import { MailerService } from '@nestjs-modules/mailer';
import { RoleService } from '../role/role.service';
import { Role } from '../role/schema/Role.schema';
import { ResetPasswordDto } from './dto/reset-password.dto';
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userRepository: Model<User>,
    private mailService: MailerService,
    private roleService: RoleService,
  ) {}

  isEmailExists = async (email: string) => {
    const user = await this.userRepository.exists({ email });
    if (user) {
      return true;
    }
    return false;
  };

  async create(createUserDto: CreateUserDto) {
    const {
      email,
      password,
      role,
      company_name,
      website,
      location,
      description,
    } = createUserDto;

    // Kiểm tra nếu email đã tồn tại
    const existingUser = await this.userRepository.findOne({ email });
    if (existingUser) {
      throw new BadRequestException('Email already exists.');
    }

    // Hash password trước khi lưu vào DB
    const hashedPassword = await hashPasswordHelper(password);
    const findRole = await this.roleService.findByRoleName(role);
    if (!findRole) {
      throw new BadRequestException(
        'Role not found. Please check if the role exists.',
      );
    }
    const user = new this.userRepository({
      ...createUserDto,
      password: hashedPassword,
      role: findRole._id,
    });

    // Phân biệt giữa User và Employer
    if (role === 'EMPLOYER') {
      if (!company_name || !website || !location) {
        throw new BadRequestException(
          'Missing employer details: company_name, website, and location are required.',
        );
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
      .select('-password')
      .populate({
        path:'role',
        select: '-createdAt -updatedAt -description'
      })
    return {
        items: result,
        meta: {
          count: result.length,
          current_page: current,
          per_page: pageSize,
          total: totalItems,
          total_pages: totalPages,
        },
    };
  }

  async findByEmail(email: string) {
    const user = await this.userRepository.findOne({ email });
    return user;
  }

  async findOne(id: string) {
    try {
      const user = await this.userRepository
        .findOne({ _id: id })
        .select('-password') // Use a space-separated string for excluding fields
        // .populate('role')
        // .populate('education_ids')
      if (user) {
        return user;
      }
      return null;
    } catch (error) {
      throw new NotFoundException();
    }
  }
  async findByObjectId(id:string){
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ID format');
    }
  
    try {
      const userId = new Types.ObjectId(id); // Chuyển đổi id sang ObjectId
      const user = await this.userRepository
        .findOne({ _id: userId }) // Sử dụng userId
        .select('-password')
        .populate('role');
  
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return user;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw new NotFoundException('User not found');
    }
  }
  async getDetailUser(id: string) {
    try {
      const user = await this.userRepository
      .findOne({ _id: id })
      .select(['-password', '-code_id', '-code_expired'])
      .populate('role')
      .populate('education_ids')
      .populate('work_experience_ids')
      .populate('organization')
      .populate('skills')
      .populate('certificates')
      .populate('prizes')
      .populate('projects')
      .populate('courses')
      .populate('city_id')
      .populate('district_id')
      .populate('ward_id')
      .populate({
        path:'cvs',
        select:'-public_id -createdAt -updatedAt -user_id '
      })
      .exec();
      console.log("user",user)
      if (user) {
        return {
          items: user,
        };
      }
      return null;
    } catch (error) {
      console.error("Populate error:", error);  // In ra lỗi populate để debug
      throw new NotFoundException();
    }
  }

  async update(updateUserDto: UpdateUserDto) {
    try {
      // Kiểm tra định dạng và độ dài số điện thoại
      const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/g; // Kiểm tra số điện thoại chỉ chứa các chữ số và không quá 10 ký tự
      if (updateUserDto.phone && !phoneRegex.test(updateUserDto.phone)) {
        throw new BadRequestException('Phone number must be numeric and up to 10 digits');
      }
  
      // Kiểm tra số điện thoại đã tồn tại trong hệ thống, ngoại trừ chính người dùng hiện tại
      const existingUserByPhone = await this.userRepository.findOne({ phone: updateUserDto.phone });
      console.log('exis',existingUserByPhone)
      console.log('exis',existingUserByPhone)
      if (existingUserByPhone && existingUserByPhone._id+"" !== updateUserDto.id) {
        throw new BadRequestException('Phone number is already in use');
      }
  
      // Kiểm tra ID người dùng và cập nhật
      const updatedUser = await this.userRepository.findOneAndUpdate(
        { _id: updateUserDto.id },  // Tìm người dùng theo ID
        { $set: updateUserDto },  // Cập nhật người dùng với dữ liệu mới
        { new: true },  // Trả về bản ghi mới đã được cập nhật
      );
  
      if (!updatedUser) {
        throw new NotFoundException('User not found');
      }
  
      // Loại bỏ password trước khi trả về
      const { password, ...userWithoutPassword } = updatedUser.toObject();
  
      return userWithoutPassword; // Trả về thông tin người dùng đã được cập nhật
    } catch (error) {
      // Xử lý lỗi
      throw new BadRequestException(error.message);
    }
  }

  async updateAfterVerify(id: string, is_active: boolean) {
    try {
      const user = await this.userRepository.findByIdAndUpdate(id, {
        is_active,
      });
      return user;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async remove(id: string) {
    // Kiểm tra xem id có phải là ObjectId hợp lệ không
    if (!mongoose.isValidObjectId(id)) {
      throw new BadRequestException('Id không đúng định dạng');
    }

    // Thực hiện xóa người dùng theo id
    const result = await this.userRepository.deleteOne({ _id: id });

    // Kiểm tra kết quả của việc xóa
    if (result.deletedCount === 0) {
      throw new NotFoundException('Không tìm thấy người dùng với id này');
    }

    // Nếu xóa thành công, trả về message
    return id;
  }

  async handleRegister(registerDto: RegisterAuthDto) {
    const {
      email,
      password,
      full_name,
      role,
      company_name,
      website,
      location,
      description,
    } = registerDto;
    // Kiểm tra định dạng email hợp lệ
    if (!emailRegex.test(email)) {
      throw new BadRequestException('Email is not valid');
    }
  
  
    const isEmailExists = await this.isEmailExists(email);

    if (isEmailExists) {
      throw new BadRequestException(`Email {${email}} already exists`);    
    }
      // Kiểm tra mật khẩu hợp lệ theo biểu thức chính quy
      if (!passwordRegex.test(password)) {
        throw new BadRequestException(
          'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.'
        );
      }
    

    const hashPassword = await hashPasswordHelper(password);
    const findRole = await this.roleService.findByRoleName(role);

    if (!findRole) {
      throw new BadRequestException(
        'Role not found. Please check if the role exists.',
      );
    }

    const codeId = uuidv4();

    // Prepare the base user data
    const userData: any = {
      full_name,
      email,
      password: hashPassword,
      role: findRole._id,
      is_active: false,
      code_id: codeId,
      code_expired: dayjs().add(30, 'd'),
    };

    // If the role is EMPLOYER, add employer-specific fields
    if (role === 'EMPLOYER') {
      userData.company_name = company_name;
      userData.website = website;
      userData.location = location;
      userData.description = description;
    }

    const newUser = await this.userRepository.create(userData);
    // Send activation email
    try {
      this.mailService.sendMail({
        to: newUser.email,
        subject: 'Kích hoạt tài khoản tại @dennis', // Subject line
        text: 'Chào mừng', // plaintext body
        template: 'template',
        context: {
          name: newUser?.full_name ?? newUser.email,
          activationCode: codeId,
        },
      });
    } catch (error) {
      console.error("error",error)
      
    }


    return {
        user_id: newUser._id,
    };
  }
  async retryActive(email: string) {
    const user = await this.userRepository.findOne({ email });

    if(!user){
      throw new BadRequestException('User not found');
    }
    if(user.is_active){
      throw new BadRequestException('User is active');
    }
    const codeId = uuidv4();

    //update code
    await user.updateOne({
      code_id: codeId,
      code_expired: dayjs().add(30, 'd'),
    })

    this.mailService.sendMail({
      to: user.email,
      subject: 'Kích hoạt tài khoản tại @dennis',
      text: 'Chào mừng',
      template: 'template',
      context: {
        name: user?.full_name ?? user.email,
        activationCode: codeId,
      },
    });

    return {
        user_id: user._id,
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<string> {
    const { user_id, current_password, new_password } = resetPasswordDto;
  
    // Find the user by user_id
    const user = await this.userRepository.findOne({ _id: user_id });
  
    // If the user doesn't exist, throw an exception
    if (!user) {
      throw new NotFoundException('User not found');
    }
  
    // Compare the current password with the stored hashed password
    const isPasswordValid = await comparePasswordHelper(current_password, user.password);
  
    // If the passwords don't match, throw an exception
    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }
  
    // Check if the new password is the same as the current password
    const isNewPasswordSameAsCurrent = await comparePasswordHelper(new_password, user.password);
    if (isNewPasswordSameAsCurrent) {
      throw new BadRequestException('New password cannot be the same as the current password');
    }
  
    // Hash the new password
    const hashedPassword = await hashPasswordHelper(new_password);
  
    // Update the user's password
    user.password = hashedPassword;
    await user.save();
  
    return 'Password reset successfully';
  }

  async calculateProfileCompletion(userId: string): Promise<number> {
    const user = await this.userRepository.findOne({_id:userId})
    .select(['-password', '-code_id', '-code_expired'])
    .populate('role')
    .populate('education_ids')
    .populate('work_experience_ids')
    .populate('organization')
    .populate('skills')
    .populate('certificates')
    .populate('prizes')
    .populate('projects')
    .populate('courses')
    .populate({
      path:'cvs',
      select:'-public_id -createdAt -updatedAt -user_id '
    }).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const sections = {
      skills: 15,         // 15% cho kỹ năng
      certificates: 10,   // 10% cho chứng chỉ
      prizes: 10,         // 10% cho giải thưởng
      courses: 10,        // 10% cho khóa học
      cvs: 15,            // 15% cho CVs
      projects: 20,       // 20% cho dự án
      education: 20,      // 20% cho giáo dục
    };

    let completion = 0;

    if (user.skills && user.skills.length > 0) completion += sections.skills;
    if (user.certificates && user.certificates.length > 0) completion += sections.certificates;
    if (user.prizes && user.prizes.length > 0) completion += sections.prizes;
    if (user.courses && user.courses.length > 0) completion += sections.courses;
    if (user.cvs && user.cvs.length > 0) completion += sections.cvs;
    if (user.projects && user.projects.length > 0) completion += sections.projects;
    if (user.education_ids && user.education_ids.length > 0) completion += sections.education;

    return completion;
  }
}
