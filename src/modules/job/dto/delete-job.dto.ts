import { IsNotEmpty } from 'class-validator';

export class DeleteJobDto {
  @IsNotEmpty()
  ids: Array<string>;

  @IsNotEmpty()
  user_id: string;
}

export class ToggleLikeDTO {
  @IsNotEmpty()
  user_id: string;
  @IsNotEmpty()
  job_id: string;
}
