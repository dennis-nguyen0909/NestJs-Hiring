import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { Public } from 'src/decorator/customize';

@Controller('role')
@ApiTags('Role') // Tag cho Swagger
@Public() // Đánh dấu API là public
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post('create')
  @ApiOperation({ summary: 'Tạo role mới' })
  @ApiResponse({ status: 201, description: 'Role được tạo thành công.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ.' })
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách các role' })
  @ApiQuery({ name: 'current', required: false, description: 'Trang hiện tại', type: String })
  @ApiQuery({ name: 'pageSize', required: false, description: 'Số lượng phần tử trên mỗi trang', type: String })
  @ApiQuery({ name: 'query', required: false, description: 'Từ khóa tìm kiếm', type: String })
  @ApiResponse({ status: 200, description: 'Danh sách các role.' })
  findAll(
    @Query() query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.roleService.findAll(query, +current, +pageSize);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết của một role' })
  @ApiParam({ name: 'id', description: 'ID của role', type: String })
  @ApiResponse({ status: 200, description: 'Thông tin role.' })
  @ApiResponse({ status: 404, description: 'Role không tồn tại.' })
  findOne(@Param('id') id: string) {
    return this.roleService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin của một role' })
  @ApiParam({ name: 'id', description: 'ID của role cần cập nhật', type: String })
  @ApiResponse({ status: 200, description: 'Role được cập nhật thành công.' })
  @ApiResponse({ status: 404, description: 'Role không tồn tại.' })
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa một role' })
  @ApiParam({ name: 'id', description: 'ID của role cần xóa', type: String })
  @ApiResponse({ status: 200, description: 'Role đã được xóa.' })
  @ApiResponse({ status: 404, description: 'Role không tồn tại.' })
  remove(@Param('id') id: string) {
    return this.roleService.remove(id);
  }
}
