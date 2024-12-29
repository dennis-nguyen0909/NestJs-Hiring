import { Meta } from '../types';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './schemas/user.schema';

export interface IUserRepository {
  // Tạo mới một người dùng
  create(data: CreateUserDto): Promise<User>;

  // Tìm kiếm một người dùng theo điều kiện
  findOne(
    query: string,
    current: number,
    pageSize: number,
  ): Promise<User | null>;

  // Lấy danh sách tất cả người dùng
  findAll(
    query: string,
    current: number,
    pageSize: number,
  ): Promise<{ items: User[]; meta: Meta }>;

  // Cập nhật thông tin người dùng
  update(updateDto: UpdateUserDto): Promise<Partial<User>>;

  // Xóa một người dùng theo ID
  remove(id: string): Promise<string>;
}
