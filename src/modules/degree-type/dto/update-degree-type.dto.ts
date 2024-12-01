import { PartialType } from '@nestjs/swagger';
import { CreateDegreeTypeDto } from './create-degree-type.dto';

export class UpdateDegreeTypeDto extends PartialType(CreateDegreeTypeDto) {}
