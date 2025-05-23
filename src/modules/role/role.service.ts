import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role } from './schema/Role.schema';
import aqp from 'api-query-params';
import { IRoleService } from './role.interface';
import { Meta } from '../types';

@Injectable()
export class RoleService implements IRoleService {
  constructor(@InjectModel(Role.name) private roleRepository: Model<Role>) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const { role_name, role_permission } = createRoleDto;
    const uppercasedRoleName = role_name.toUpperCase().trim();

    const existingRole = await this.roleRepository.findOne({
      role_name: uppercasedRoleName,
    });
    if (existingRole) {
      throw new BadRequestException('Role already exists');
    }
    const newRole = await this.roleRepository.create({
      role_name: uppercasedRoleName,
      role_permission,
    });

    return newRole;
  }

  async findAll(
    query: string,
    current: number,
    pageSize: number,
  ): Promise<{ items: Role[]; meta: Meta }> {
    try {
      const { filter, sort } = aqp(query);
      if (filter.current) delete filter.current;
      if (filter.pageSize) delete filter.pageSize;
      //check NaN
      if (!current) current = 1;
      if (!pageSize) pageSize = 10;
      // total items
      const totalItems = (await this.roleRepository.find(filter)).length;
      const totalPages = Math.ceil(totalItems / pageSize);
      const skip = (+current - 1) * pageSize;
      const result = await this.roleRepository
        .find(filter)
        .limit(pageSize)
        .skip(skip)
        .sort(sort as any);
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
    } catch (error) {
      throw new Error(error);
    }
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new BadRequestException('Role not found');
    }
    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const updatedRole = await this.roleRepository.findByIdAndUpdate(
      id,
      updateRoleDto,
      { new: true },
    );
    if (!updatedRole) {
      throw new BadRequestException('Role not found');
    }
    return updatedRole;
  }

  async remove(id: string): Promise<{ message: string }> {
    const result = await this.roleRepository.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      throw new BadRequestException('Role not found');
    }
    return { message: 'Role deleted successfully' }; // Provide meaningful response
  }

  async findByRoleName(role_name: string): Promise<Role> {
    const role = await this.roleRepository.findOne({ role_name });
    return role;
  }

  async getRoleEmployer(): Promise<Role> {
    return this.roleRepository.findOne({ role_name: 'EMPLOYER' });
  }
}
