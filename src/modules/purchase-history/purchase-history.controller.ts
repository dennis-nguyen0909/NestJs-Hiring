import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PurchaseHistoryService } from './purchase-history.service';
import { CreatePurchaseHistoryDto } from './dto/create-purchase-history.dto';
import { UpdatePurchaseHistoryDto } from './dto/update-purchase-history.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/schemas/user.schema';

@Controller('purchase-history')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PurchaseHistoryController {
  constructor(
    private readonly purchaseHistoryService: PurchaseHistoryService,
  ) {}

  @Post()
  @Roles(Role.Admin)
  create(@Body() createPurchaseHistoryDto: CreatePurchaseHistoryDto) {
    return this.purchaseHistoryService.create(createPurchaseHistoryDto);
  }

  @Get()
  @Roles(Role.Admin)
  findAll() {
    return this.purchaseHistoryService.findAll();
  }

  @Get('my-purchases')
  findMyPurchases(@GetUser() user: User) {
    return this.purchaseHistoryService.findByUserId(user._id.toString());
  }

  @Get('my-active-purchases')
  findMyActivePurchases(@GetUser() user: User) {
    return this.purchaseHistoryService.findActivePurchases(user._id.toString());
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.purchaseHistoryService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.Admin)
  update(
    @Param('id') id: string,
    @Body() updatePurchaseHistoryDto: UpdatePurchaseHistoryDto,
  ) {
    return this.purchaseHistoryService.update(id, updatePurchaseHistoryDto);
  }

  @Delete(':id')
  @Roles(Role.Admin)
  remove(@Param('id') id: string) {
    return this.purchaseHistoryService.remove(id);
  }
}
