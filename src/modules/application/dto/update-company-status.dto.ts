import { PartialType } from '@nestjs/swagger';
import { CreateCompanyStatusDto } from './create-company-status.dto';

export class UpdateCompanyStatusDto extends PartialType(
  CreateCompanyStatusDto,
) {}
