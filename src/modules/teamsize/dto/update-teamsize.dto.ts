import { PartialType } from '@nestjs/swagger';
import { CreateTeamsizeDto } from './create-teamsize.dto';

export class UpdateTeamsizeDto extends PartialType(CreateTeamsizeDto) {}
