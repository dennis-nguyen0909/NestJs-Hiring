/* eslint-disable prettier/prettier */
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { Organization } from './schema/organization.schema';
import { User } from '../users/schemas/User.schema';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectModel(Organization.name)
    private organizationModel: Model<Organization>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  // Tạo tổ chức mới
  async create(createOrganizationDto: CreateOrganizationDto, userId: string) {
    // Kiểm tra xem người dùng có tồn tại không
    const user = await this.userModel.findById(createOrganizationDto.owner);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Kiểm tra xem user đã có tổ chức chưa
    const existingOrganization = await this.organizationModel.findOne({
      owner: createOrganizationDto.owner,
    });

    if (existingOrganization) {
      // Nếu đã có tổ chức, không cho phép tạo tổ chức mới
     const updateOrgan = await this.update(
        existingOrganization._id.toString(),
        createOrganizationDto,
      );
      return updateOrgan
    }else{
      // Nếu chưa có tổ chức, tạo tổ chức mới
      const createdOrganization = await this.organizationModel.create(
        createOrganizationDto,
      );
  
      // Cập nhật user với tổ chức mới mà không cần gọi save()
      await this.userModel.updateOne(
        { _id: createOrganizationDto.owner },
        {
          $set: {
            organization: new Types.ObjectId(createdOrganization._id.toString()),
          },
        },
      );
  
      return createdOrganization;
    }
  }

  // Lấy tất cả tổ chức
  async findAll() {
    return this.organizationModel.find().exec();
  }

  // Lấy tổ chức theo ID
  async findOne(id: string) {
    const organization = await this.organizationModel.findById(id).exec();
    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }
    return organization;
  }

  // Cập nhật tổ chức
  async update(id: string, updateOrganizationDto: UpdateOrganizationDto) {
    // Kiểm tra tổ chức có tồn tại không
    const organization = await this.organizationModel.findById(id).exec();
    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }

    return this.organizationModel
      .findByIdAndUpdate(id, updateOrganizationDto, { new: true })
      .exec();
  }

  // Xóa tổ chức
  async remove(id: string) {
    const organization = await this.organizationModel.findById(id).exec();
    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }

    return this.organizationModel.findByIdAndDelete(id).exec();
  }

  async findByOwner(ownerId: string) {
    return this.organizationModel
      .find({ owner: ownerId })
      .populate('owner')
      .exec();
  }
}
