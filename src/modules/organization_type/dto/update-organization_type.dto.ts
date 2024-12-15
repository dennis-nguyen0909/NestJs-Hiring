import { PartialType } from '@nestjs/swagger';
import { CreateOrganizationTypeDto } from './create-organization_type.dto';

export class UpdateOrganizationTypeDto extends PartialType(CreateOrganizationTypeDto) {}
