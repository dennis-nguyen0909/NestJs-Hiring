import { PartialType } from '@nestjs/swagger';
import { CreateIndustryTypeDto } from './create-industry_type.dto';

export class UpdateIndustryTypeDto extends PartialType(CreateIndustryTypeDto) {}
