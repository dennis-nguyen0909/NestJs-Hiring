import { PartialType } from '@nestjs/mapped-types';
import { CreateSkillEmployerDto } from './create-skill.dto';

export class UpdateSkillEmployerDto extends PartialType(
  CreateSkillEmployerDto,
) {}
