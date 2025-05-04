import { PartialType } from '@nestjs/mapped-types';
import { CreateMonthlyUsageDto } from './create-monthly-usage.dto';

export class UpdateMonthlyUsageDto extends PartialType(CreateMonthlyUsageDto) {}
