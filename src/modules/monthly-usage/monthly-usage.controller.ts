import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { MonthlyUsageService } from './monthly-usage.service';
import { CreateMonthlyUsageDto } from './dto/create-monthly-usage.dto';
import { UpdateMonthlyUsageDto } from './dto/update-monthly-usage.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/schemas/user.schema';

@Controller('monthly-usage')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MonthlyUsageController {
  constructor(private readonly monthlyUsageService: MonthlyUsageService) {}

  @Post()
  @Roles(Role.Admin)
  create(@Body() createMonthlyUsageDto: CreateMonthlyUsageDto) {
    return this.monthlyUsageService.create(createMonthlyUsageDto);
  }

  @Get()
  @Roles(Role.Admin)
  findAll() {
    return this.monthlyUsageService.findAll();
  }

  @Get('my-usage')
  findMyUsage(@GetUser() user: User, @Query('yearMonth') yearMonth: string) {
    return this.monthlyUsageService.findByUserIdAndMonth(
      user._id.toString(),
      yearMonth,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.monthlyUsageService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.Admin)
  update(
    @Param('id') id: string,
    @Body() updateMonthlyUsageDto: UpdateMonthlyUsageDto,
  ) {
    return this.monthlyUsageService.update(id, updateMonthlyUsageDto);
  }

  @Delete(':id')
  @Roles(Role.Admin)
  remove(@Param('id') id: string) {
    return this.monthlyUsageService.remove(id);
  }

  @Post('reset')
  @Roles(Role.Admin)
  resetMonthlyUsage(
    @Query('userId') userId: string,
    @Query('yearMonth') yearMonth: string,
  ) {
    return this.monthlyUsageService.resetMonthlyUsage(userId, yearMonth);
  }
}
