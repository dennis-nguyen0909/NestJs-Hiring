import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRoleDto {
  @IsNotEmpty()
  @IsString()
  role_name: string;

  @IsOptional()
  role_permission: Array<string>;
}
