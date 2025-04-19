/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model, Types } from 'mongoose';
import {
  cloudinaryPublicIdRegex,
  comparePasswordHelper,
  emailRegex,
  generatorOtp,
  hashPasswordHelper,
  passwordRegex,
  publicIdRegexOwn,
} from 'src/helpers/util';
import aqp from 'api-query-params';
import mongoose from 'mongoose';
import { RegisterAuthDto } from '../auth/dto/register-auth.dto';
import { v4 as uuidv4 } from 'uuid';
import * as dayjs from 'dayjs';
import { MailerService } from '@nestjs-modules/mailer';
import { RoleService } from '../role/role.service';
import { Role } from '../role/schema/Role.schema';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AuthProviderService } from '../auth-provider/auth-provider.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { NotificationService } from 'src/notification/notification.service';
import { Meta } from '../types';
import { IUserRepository } from './user.interface';
import { Cities } from '../cities/schema/Cities.schema';
import { District } from '../districts/schema/District.schema';
import { LogService } from 'src/log/log.service';
import { UAParser } from 'ua-parser-js';
import { Request } from 'express';
import { CompanyStatusService } from '../application/company-status.service';
const MAX_OTP_ATTEMPTS = 5;
const OTP_ATTEMPT_WINDOW = 60;
@Injectable()
export class UsersService implements IUserRepository {
  constructor(
    @InjectModel(User.name) private readonly userRepository: Model<User>,
    @InjectModel(Cities.name) private readonly citiesModel: Model<Cities>,
    @InjectModel(District.name) private readonly districtModel: Model<District>,
    private mailService: MailerService,
    private roleService: RoleService,
    private authProviderService: AuthProviderService,
    private cloudinaryService: CloudinaryService,
    private notificationService: NotificationService,
    private logService: LogService,
    private companyStatusService: CompanyStatusService,
  ) {}

  isEmailExists = async (email: string): Promise<boolean> => {
    const user = await this.userRepository.exists({ email });
    if (user) {
      return true;
    }
    return false;
  };

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { password, authProvider } = createUserDto;

    const hashedPassword = await hashPasswordHelper(password);

    const newUser = {
      ...createUserDto,
      password: hashedPassword,
      auth_providers: [],
    };

    if (authProvider) {
      newUser.auth_providers.push(new Types.ObjectId(authProvider + ''));
    } else {
      const authProviderLocal = await this.authProviderService.findDynamic({
        provider_id: 'local',
      });
      newUser.auth_providers.push(
        new Types.ObjectId(authProviderLocal?._id + ''),
      );
    }
    return this.userRepository.create(newUser);
  }

  async findAll(
    query: string,
    current: number,
    pageSize: number,
  ): Promise<{ items: User[]; meta: Meta }> {
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
        path: 'role',
        select: '-createdAt -updatedAt -description',
      });
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

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ email });
    return user;
  }
  async findOneFilter(id: string): Promise<User> {
    try {
      const user = await this.userRepository
        .findOne({ _id: id })
        .select('-password ');
      if (user) {
        return user;
      }
      return null;
    } catch (error) {
      throw new NotFoundException();
    }
  }

  async findByObjectId(id: string) {
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
  async getDetailUser(id: string): Promise<{ items: User }> {
    try {
      const user = await this.userRepository
        .findOne({ _id: id })
        .select(['-password', '-code_id', '-code_expired'])
        .populate('role')
        .populate('auth_providers')
        .populate('account_type')
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
        .populate('social_links')
        .populate('favorite_jobs')
        .populate({
          path: 'cvs',
          select: '-public_id -createdAt -updatedAt -user_id ',
        })
        .exec();
      if (user) {
        return {
          items: user,
        };
      }
      return null;
    } catch (error) {
      console.error('Populate error:', error); // In ra lỗi populate để debug
      throw new BadRequestException();
    }
  }

  async update(
    updateUserDto: UpdateUserDto,
    request: Request,
  ): Promise<Partial<User>> {
    try {
      const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/g;
      if (updateUserDto.phone && !phoneRegex.test(updateUserDto.phone)) {
        throw new BadRequestException(
          'Phone number must be numeric and up to 10 digits',
        );
      }

      const existingUserByPhone = await this.userRepository.findOne({
        phone: updateUserDto.phone,
      });
      const existUser = await this.userRepository.findOne({
        _id: updateUserDto.id,
      });
      if (
        existingUserByPhone &&
        existingUserByPhone._id + '' !== updateUserDto.id
      ) {
        throw new BadRequestException('Phone number is already in use');
      }
      if (
        updateUserDto.avatar ||
        updateUserDto.avatar_company ||
        updateUserDto.banner_company ||
        updateUserDto.background
      ) {
        if (existUser?.avatar && updateUserDto.avatar) {
          const url = existUser.avatar.match(cloudinaryPublicIdRegex);
          if (url && url[1]) {
            const publicId = url[1];
            await this.cloudinaryService.deleteFile(publicId);
          }
        }
        if (existUser?.avatar_company && updateUserDto.avatar_company) {
          const url = existUser.avatar_company.match(cloudinaryPublicIdRegex);
          if (url && url[1]) {
            const publicId = url[1];
            await this.cloudinaryService.deleteFile(publicId);
          }
        }
        if (existUser?.banner_company && updateUserDto.banner_company) {
          const url = existUser.banner_company.match(cloudinaryPublicIdRegex);
          if (url && url[1]) {
            const publicId = url[1];
            await this.cloudinaryService.deleteFile(publicId);
          }
        }
        if (existUser?.background && updateUserDto.background) {
          const url = existUser.background.match(cloudinaryPublicIdRegex);
          if (url && url[1]) {
            const publicId = url[1];
            await this.cloudinaryService.deleteFile(publicId);
          }
        }
      }
      const oldUserData = existUser.toObject();
      const { id, ...updateUserData } = updateUserDto;
      const updatedUser = await this.userRepository
        .findOneAndUpdate(
          { _id: updateUserDto.id }, // Tìm người dùng theo ID
          {
            $set: {
              city_id: new Types.ObjectId(updateUserDto.city_id),
              district_id: new Types.ObjectId(updateUserDto.district_id),
              ward_id: new Types.ObjectId(updateUserDto.ward_id),
              account_type: new Types.ObjectId(updateUserDto.account_type),
              ...updateUserData,
            },
          }, // Cập nhật người dùng với dữ liệu mới
          { new: true }, // Trả về bản ghi mới đã được cập nhật
        )
        .select(['-password', '-code_id', '-code_expired'])
        .populate('role')
        .populate('auth_providers')
        .populate('account_type')
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
        .populate('social_links')
        .populate('favorite_jobs')
        .populate({
          path: 'cvs',
          select: '-public_id -createdAt -updatedAt -user_id ',
        });

      if (!updatedUser) {
        throw new NotFoundException('User not found');
      }
      const changes = {};

      for (const key in updateUserDto) {
        if (
          key !== '_id' &&
          key !== 'id' &&
          key !== 'city_id' &&
          key !== 'district_id' &&
          key !== 'ward_id'
        ) {
          // Bỏ qua _id hoặc id
          if (oldUserData[key] !== updateUserDto[key]) {
            changes[key] = { old: oldUserData[key], new: updateUserDto[key] };
          }
        }
      }

      if (Object.keys(changes).length > 0) {
        await this.logService.createLog({
          userId: new Types.ObjectId(updatedUser._id.toString()),
          userRole: updatedUser?.role?.role_name,
          action: 'UPDATE',
          entityId: updatedUser._id.toString(),
          entityCollection: 'users',
          changes,
          activityDetail: 'user_update_info',
          description: 'User profile update',
          entityName: updatedUser?.full_name ?? updatedUser?.email,
          req: request,
        });
      }

      const { password, ...userWithoutPassword } = updatedUser.toObject();

      return updatedUser;
    } catch (error) {
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

  async remove(id: string): Promise<string> {
    // Kiểm tra xem id có phải là ObjectId hợp lệ không
    if (!mongoose.isValidObjectId(id)) {
      throw new BadRequestException('Id không đúng định dạng');
    }

    // Thực hiện xóa người dùng theo id
    const result = await this.userRepository.findByIdAndDelete(id);

    // Kiểm tra kết quả của việc xóa
    if (!result) {
      throw new NotFoundException('Không tìm thấy người dùng với id này');
    }

    // Nếu xóa thành công, trả về message
    return id;
  }

  async handleRegister(
    registerDto: RegisterAuthDto,
  ): Promise<{ user_id: string }> {
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
        'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.',
      );
    }

    const hashPassword = await hashPasswordHelper(password);
    const findRole = await this.roleService.findByRoleName(role);
    const roles = await this.roleService.findAll('', 1, 15);
    if (!findRole) {
      throw new BadRequestException(
        'Role not found. Please check if the role exists.',
      );
    }

    const codeId = uuidv4();
    const authProviders = [];
    let accountType;
    if (registerDto?.authProvider) {
      authProviders.push(new Types.ObjectId(registerDto?.authProvider + ''));
      accountType = new Types.ObjectId(registerDto?.authProvider + '');
    } else {
      const authProviderLocal = await this.authProviderService.findDynamic({
        provider_id: 'local',
      });
      authProviders.push(new Types.ObjectId(authProviderLocal?._id + ''));
      accountType = new Types.ObjectId(
        new Types.ObjectId(authProviderLocal?._id + ''),
      );
    }
    // Prepare the base user data
    const userData: any = {
      full_name,
      email,
      password: hashPassword,
      role: findRole._id,
      is_active: false,
      code_id: codeId,
      code_expired: dayjs().add(30, 'd'),
      auth_providers: authProviders,
      account_type: accountType,
    };

    // If the role is EMPLOYER, add employer-specific fields
    if (role === 'EMPLOYER') {
      userData.company_name = company_name;
      userData.website = website;
      userData.location = location;
      userData.description = description;
    }

    const newUser = await this.userRepository.create(userData);

    // If the role is EMPLOYER, create initial statuses
    if (role === 'EMPLOYER') {
      const initialStatuses = [
        {
          name: 'Pending',
          description: 'Application is pending review',
          order: 1,
          color: '#95a5a6',
          is_active: true,
        },
        {
          name: 'Applied',
          description: 'Application has been submitted',
          order: 2,
          color: '#3498db',
          is_active: true,
        },
        {
          name: 'Reviewing',
          description: 'Application is being reviewed',
          order: 3,
          color: '#f1c40f',
          is_active: true,
        },
        {
          name: 'Interview',
          description: 'Candidate is invited for interview',
          order: 4,
          color: '#2ecc71',
          is_active: true,
        },
        {
          name: 'Offered',
          description: 'Job offer has been made',
          order: 5,
          color: '#9b59b6',
          is_active: true,
        },
        {
          name: 'Rejected',
          description: 'Application has been rejected',
          order: 6,
          color: '#e74c3c',
          is_active: true,
        },
      ];

      // Create each status
      for (const status of initialStatuses) {
        await this.companyStatusService.create(newUser._id.toString(), status);
      }
    }

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
      console.error('error', error);
    }

    return {
      user_id: newUser._id.toString(),
    };
  }

  async retryActive(email: string): Promise<{ user_id: string }> {
    const user: User | null = await this.userRepository.findOne({ email });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    if (user.is_active) {
      throw new BadRequestException('User is active');
    }
    const codeId = uuidv4();

    //update code
    await user.updateOne({
      code_id: codeId,
      code_expired: dayjs().add(30, 'd'),
    });

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
      user_id: user._id.toString(),
    };
  }

  async sendOtp(email: string): Promise<any> {
    try {
      const user = await this.userRepository.findOne({ email });

      if (!user) {
        throw new BadRequestException('User not found!');
      }

      const now = new Date();
      const otpAttemptResetTime = new Date(user.lastOtpSentAt || now);
      otpAttemptResetTime.setMinutes(
        otpAttemptResetTime.getMinutes() + OTP_ATTEMPT_WINDOW,
      );

      if (now > otpAttemptResetTime) {
        user.otpAttempts = 0;
      }

      if (user.otpAttempts >= MAX_OTP_ATTEMPTS) {
        throw new BadRequestException(
          `You have reached the maximum number of OTP requests. Please try again later.`,
        );
      }

      const otp = generatorOtp(user.email);
      const otpExpiryTime = new Date();
      otpExpiryTime.setMinutes(otpExpiryTime.getMinutes() + 5);

      user.otpCode = otp;
      user.otpExpiry = otpExpiryTime;
      user.otpAttempts += 1;
      user.lastOtpSentAt = now;

      await user.save();

      this.mailService.sendMail({
        to: user.email,
        subject: 'Reset Password - @dennis',
        text: 'OTP Reset Password',
        template: 'templateOtp',
        context: {
          name: user?.full_name ?? user.email,
          otpCode: otp,
        },
      });

      return { message: 'OTP sent to your email', status: 200 };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
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
    const isPasswordValid = await comparePasswordHelper(
      current_password,
      user.password,
    );

    // If the passwords don't match, throw an exception
    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Check if the new password is the same as the current password
    const isNewPasswordSameAsCurrent = await comparePasswordHelper(
      new_password,
      user.password,
    );
    if (isNewPasswordSameAsCurrent) {
      throw new BadRequestException(
        'New password cannot be the same as the current password',
      );
    }
    // Kiểm tra mật khẩu hợp lệ theo biểu thức chính quy
    if (!passwordRegex.test(new_password)) {
      throw new BadRequestException(
        'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.',
      );
    }

    // Hash the new password
    const hashedPassword = await hashPasswordHelper(new_password);

    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    return 'Password reset successfully';
  }

  async calculateProfileCompletion(userId: string): Promise<number> {
    const user = await this.userRepository
      .findOne({ _id: userId })
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
        path: 'cvs',
        select: '-public_id -createdAt -updatedAt -user_id ',
      })
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const sections = {
      skills: 15, // 15% cho kỹ năng
      certificates: 10, // 10% cho chứng chỉ
      prizes: 10, // 10% cho giải thưởng
      courses: 10, // 10% cho khóa học
      cvs: 15, // 15% cho CVs
      projects: 20, // 20% cho dự án
      education: 20, // 20% cho giáo dục
    };

    let completion = 0;

    if (user.skills && user.skills.length > 0) completion += sections.skills;
    if (user.certificates && user.certificates.length > 0)
      completion += sections.certificates;
    if (user.prizes && user.prizes.length > 0) completion += sections.prizes;
    if (user.courses && user.courses.length > 0) completion += sections.courses;
    if (user.cvs && user.cvs.length > 0) completion += sections.cvs;
    if (user.projects && user.projects.length > 0)
      completion += sections.projects;
    if (user.education_ids && user.education_ids.length > 0)
      completion += sections.education;

    return completion;
  }

  async getAllCompany(
    query: string,
    current: number,
    pageSize: number,
  ): Promise<{ items: User[]; meta: Meta }> {
    const { filter, sort } = aqp(query);

    // Remove pagination-related properties from filter if present
    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;

    // Set default values for current page and pageSize
    if (!current) current = 1;
    if (!pageSize) pageSize = 10;

    if (filter?.city_name && filter?.city_name['$exists'] === true) {
      delete filter.city_name;
    }

    // Apply regex filter for company_name if provided
    if (filter?.company_name) {
      let companyName =
        typeof filter?.company_name === 'string'
          ? filter.company_name.trim()
          : '';

      // Loại bỏ dấu ngoặc và ký tự đặc biệt khỏi chuỗi tìm kiếm
      companyName = companyName.replace(/[^\w\s]/g, ''); // Chỉ giữ lại chữ và số, bỏ dấu câu

      // Tách chuỗi tìm kiếm thành các từ đơn và ghép thành regex
      const searchTerms = companyName
        .split(' ')
        .filter((term) => term !== '')
        .map((term) => `(?=.*${term})`)
        .join('');

      // Tạo regex từ các từ tìm kiếm
      const regex = new RegExp(searchTerms, 'i'); // 'i' for case-insensitive search
      filter.company_name = regex;
    }
    console.log('filter', filter);
    // Xử lý city_name cho cả thành phố và quận
    if (filter.city_name) {
      // Trước tiên, tìm kiếm trong bảng cities
      const cities = await this.citiesModel
        .find({ name: { $regex: new RegExp(filter.city_name, 'i') } })
        .select('_id'); // Lấy chỉ _id của thành phố phù hợp
      if (cities.length > 0) {
        // Nếu tìm thấy thành phố, thêm vào bộ lọc city_id
        const cityIds = cities.map((city) => city._id.toString());
        filter.city_id = { $in: cityIds }; // Lọc theo city_id
      }

      // Nếu không tìm thấy thành phố, tìm kiếm trong bảng districts
      const districts = await this.districtModel
        .find({ name: { $regex: new RegExp(filter.city_name, 'i') } })
        .select('_id'); // Lấy chỉ _id của quận phù hợp
      if (districts.length > 0) {
        // Nếu tìm thấy quận, thêm vào bộ lọc district_id
        const districtIds = districts.map((district) =>
          district._id.toString(),
        );
        filter.district_id = { $in: districtIds }; // Lọc theo district_id
      }

      delete filter.city_name; // Xóa trường city_name khỏi filter sau khi xử lý
    }

    // Count total items based on the filter
    const totalItems = await this.userRepository.find(filter).countDocuments();
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (+current - 1) * pageSize;

    // Handle role field conversion to ObjectId if it exists
    if (filter?.role) {
      filter.role = new Types.ObjectId(filter.role);
    }

    // Query the userRepository with the constructed filter, pagination, and sorting
    const result = await this.userRepository
      .find(filter)
      .limit(pageSize)
      .skip(skip)
      .sort(sort as any)
      .populate('city_id', '-districts -division_type -phone_code')
      .populate('district_id', '-wards -short_codename -division_type')
      .populate('jobs_ids', '_id title')
      .select('_id avatar_company city_id district_id company_name');

    if (result) {
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
  }

  async employerSendMail(body) {
    // Gửi email cho ứng viên với các thông tin công việc và người tuyển dụng
    try {
      await this.mailService.sendMail({
        to: body?.candidateEmail, // Địa chỉ email của ứng viên
        subject: `Job Application from ${body?.recruiterCompany}`, // Tiêu đề email
        text: `Dear ${body?.candidateName}, thank you for applying!`, // Nội dung đơn giản, nếu bạn muốn hỗ trợ email không có định dạng HTML
        template: 'templateEmployer', // Tên template bạn đã tạo
        context: {
          recruiterCompany: body?.recruiterCompany,
          candidateName: body?.candidateName ?? body?.candidateEmail, // Tên ứng viên
          jobTitle: body?.jobTitle, // Tên vị trí công việc
          jobDescription: body?.jobDescription, // Mô tả công việc
          recruiterEmail: body?.recruiterEmail, // Email của công ty tuyển dụng
          interviewDate: body.interviewDate,
          interviewTime: body.interviewTime,
          interviewLocation: body.interviewLocation,
        },
      });
    } catch (error) {
      console.error(error);
    }
  }
  async checkAndUpdateProgressSetupCompany(userId: string): Promise<User> {
    const user = await this.userRepository
      .findById(userId)
      .select('-code -password -code_expired -account_type')
      .populate('role')
      .exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!user.role || user?.role?.role_name !== 'EMPLOYER') {
      return user; // Bỏ qua việc kiểm tra tiếp theo
    }

    // Kiểm tra và cập nhật company_info
    if (user.company_name && user.avatar_company && user.banner_company) {
      user.progress_setup.company_info = true;
    }

    // Kiểm tra và cập nhật founding_info
    if (user.organization) {
      user.progress_setup.founding_info = true;
    }

    // Kiểm tra và cập nhật social_info
    if (user.social_links && user.social_links.length > 0) {
      user.progress_setup.social_info = true;
    }
    // Kiểm tra và cập nhật contact
    if (
      user.phone &&
      user.email &&
      user.ward_id &&
      user.district_id &&
      user.city_id
    ) {
      user.progress_setup.contact = true;
    }

    // Lưu lại cập nhật vào cơ sở dữ liệu
    await user.save();

    return user;
  }

  async validateGoogleUser(googleUser: any) {
    // Find the user by email
    const user = await this.userRepository.findOne({
      email: googleUser?.email,
    });

    if (user) {
      if (!user.auth_providers.includes(googleUser?.authProvider)) {
        user.auth_providers.push(googleUser?.authProvider);
        await user.save();
      }
      return user;
    }

    return await this.create(googleUser);
  }

  async validateFacebookUser(facebookUser: any) {
    const user = await this.userRepository.findOne({
      email: facebookUser?.email,
    });
    if (user) {
      if (!user.auth_providers.includes(facebookUser?.authProvider)) {
        user.auth_providers.push(facebookUser?.authProvider);
        await user.save();
      }
      return user;
    }
    return await this.create(facebookUser);
  }
  async removeAvatarEmployer(type: string, userId: string): Promise<[]> {
    try {
      const user = await this.userRepository.findOne({ _id: userId });
      if (type === 'avatar_company') {
        if (user) {
          if (user.avatar_company) {
            const url = user.avatar_company.match(cloudinaryPublicIdRegex);
            if (url && url[1]) {
              const publicId = url[1];
              const cloudinaryRes =
                await this.cloudinaryService.deleteFile(publicId);
              if (cloudinaryRes.result === 'ok') {
                // Cập nhật lại avatar_company trong cơ sở dữ liệu
                const updateRes = await this.userRepository.updateOne(
                  { _id: userId },
                  {
                    avatar_company: '',
                  },
                );
              }
            }
          }
        }
      }
      if (type === 'banner_company') {
        if (user) {
          if (user.banner_company) {
            const url =
              user.banner_company.match(cloudinaryPublicIdRegex) ||
              user.banner_company.match(publicIdRegexOwn);
            if (url && url[1]) {
              const publicId = url[1];
              const cloudinaryRes =
                await this.cloudinaryService.deleteFile(publicId);
              if (cloudinaryRes.result === 'ok') {
                // Cập nhật lại banner_company trong cơ sở dữ liệu
                const updateRes = await this.userRepository.updateOne(
                  { _id: userId },
                  {
                    banner_company: '',
                  },
                );
                if (updateRes.modifiedCount > 0) {
                  return [];
                }
              }
            }
          }
        }
      }
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
  async getProfileCandidate(
    candidateId: string,
    employerId: string,
  ): Promise<{ items: User }> {
    try {
      const candidate = await this.getDetailUser(candidateId);
      const employer = await this.getDetailUser(employerId);
      if (employer && candidate) {
        // Kiểm tra nếu nhà tuyển dụng chưa xem hồ sơ, thì thêm vào mảng
        if (!candidate.items.viewer.includes(new Types.ObjectId(employerId))) {
          candidate.items.viewer.push(new Types.ObjectId(employerId));
        }
        this.userRepository.updateOne(
          { _id: candidateId },
          {
            viewer: candidate.items.viewer,
          },
        );

        await this.notificationService.notifyCandidateAboutProfileView(
          candidate.items,
          employer.items,
        );
        return candidate;
      }
    } catch (error) {
      throw new Error(error);
    }
  }
  async findOne(condition: any): Promise<User> {
    const user = await this.userRepository.findOne({ where: condition });

    if (!user) {
      throw new NotFoundException('User not found'); // Lỗi nếu không tìm thấy người dùng
    }

    return user;
  }

  async verifyOtp(email: string, otp: string): Promise<any> {
    try {
      const user = await this.userRepository.findOne({ email });
      if (!user) {
        throw new BadRequestException('User not found!');
      }

      if (user.otpAttempts >= MAX_OTP_ATTEMPTS) {
        throw new BadRequestException(
          'OTP attempts exceeded. Please request a new OTP.',
        );
      }

      if (new Date() > user.otpExpiry) {
        throw new BadRequestException('OTP expired. Please request a new OTP.');
      }

      if (+user.otpCode !== +otp) {
        user.otpAttempts += 1;
        await user.save(); // Lưu lại số lần thử OTP
        throw new BadRequestException('Invalid OTP.');
      }

      user.otpAttempts = 0;
      user.otpExpiry = new Date(Date.now() - 1);
      user.otpCode = null;
      user.isOtpVerified = true;
      user.otpVerifiedAt = new Date();
      await user.save();

      return { message: 'OTP verified. You can now reset your password.' };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
  async resetPasswordWithOtp(email: string, newPassword: string): Promise<any> {
    try {
      const user = await this.userRepository.findOne({ email });
      if (!user) {
        throw new BadRequestException('User not found!');
      }

      if (!user.isOtpVerified) {
        throw new BadRequestException(
          'OTP not verified. Please verify the OTP before resetting the password.',
        );
      }
      // Kiểm tra thời gian từ khi OTP được xác thực có còn hợp lệ không
      const otpVerifiedAt = new Date(user.otpVerifiedAt);
      const otpVerificationValidity = 5 * 60 * 1000;
      if (
        new Date().getTime() - otpVerifiedAt.getTime() >
        otpVerificationValidity
      ) {
        throw new BadRequestException(
          'OTP verification has expired. Please verify the OTP again.',
        );
      }
      // Kiểm tra mật khẩu hợp lệ theo biểu thức chính quy
      if (!passwordRegex.test(newPassword)) {
        throw new BadRequestException(
          'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.',
        );
      }

      const hashedPassword = await hashPasswordHelper(newPassword);

      user.password = hashedPassword;
      user.isOtpVerified = false;
      user.otpVerifiedAt = null;
      await user.save();

      return { message: 'Password reset successfully' };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getViewedJobs(
    userId: string,
    query: string,
    current: number,
    pageSize: number,
  ): Promise<{ items: any[]; meta: Meta }> {
    console.log('userId', userId);
    const { filter, sort } = aqp(query);

    // Remove pagination-related properties from filter if present
    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;

    // Check for NaN and set defaults
    if (!current) current = 1;
    if (!pageSize) pageSize = 10;

    // Find the user first to check if they exist
    const user = await this.userRepository.findOne({
      _id: new Types.ObjectId(userId),
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get the total count of viewed jobs for this user
    const userWithViewedJobsCount = await this.userRepository
      .findOne({
        _id: new Types.ObjectId(userId),
      })
      .populate({
        path: 'viewed_jobs',
        populate: {
          path: 'user_id',
          select: '_id avatar_company banner_company company_name',
        },
        // options: { sort: { createdAt: -1 } },
      });

    const totalItems = userWithViewedJobsCount.viewed_jobs?.length || 0;
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (+current - 1) * pageSize;

    // Get paginated viewed jobs with populated user_id
    const userWithPaginatedJobs = await this.userRepository
      .findOne({ _id: new Types.ObjectId(userId) })
      .populate({
        path: 'viewed_jobs',
        populate: [
          {
            path: 'user_id',
            select: '_id avatar_company banner_company company_name',
          },
          { path: 'job_type', select: 'name key' },
        ],
        options: {
          skip: skip,
          limit: pageSize,
          sort: sort || { createdAt: -1 }, // Use provided sort or default to createdAt desc
        },
      });

    return {
      items: userWithPaginatedJobs.viewed_jobs || [],
      meta: {
        count: userWithPaginatedJobs.viewed_jobs?.length || 0,
        current_page: +current,
        per_page: +pageSize,
        total: totalItems,
        total_pages: totalPages,
      },
    };
  }

  async countViewedJobs(id: string): Promise<number> {
    try {
      const result = await this.userRepository.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(id) } },
        { $project: { viewedJobsCount: { $size: '$viewed_jobs' } } },
      ]);

      if (result && result.length > 0) {
        return result[0].viewedJobsCount;
      }

      return 0; // Return 0 if user not found or viewed_jobs is empty
    } catch (error) {
      console.error('Error counting viewed jobs:', error);
      throw new BadRequestException(
        'An error occurred while counting viewed jobs.',
      );
    }
  }
}
