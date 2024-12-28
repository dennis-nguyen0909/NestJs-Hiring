import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './schema/Role.schema';

export interface IRoleService {
  create(createRoleDto: CreateRoleDto): Promise<Role>;

  findAll(
    query: string,
    current: number,
    pageSize: number,
  ): Promise<{ items: Role[]; meta: any }>;

  findOne(id: string): Promise<Role>;

  update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role>;

  remove(id: string): Promise<{ message: string }>;

  findByRoleName(role_name: string): Promise<Role | null>;

  getRoleEmployer(): Promise<Role | null>;
}
