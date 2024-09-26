import { IsNotEmpty } from 'class-validator';

export class DeleteJobDto {
  @IsNotEmpty()
  ids: Array<string>;

  @IsNotEmpty()
  user_id: string;
}
