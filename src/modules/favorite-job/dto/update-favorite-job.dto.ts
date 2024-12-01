import { PartialType } from '@nestjs/swagger';
import { CreateFavoriteJobDto } from './create-favorite-job.dto';

export class UpdateFavoriteJobDto extends PartialType(CreateFavoriteJobDto) {}
