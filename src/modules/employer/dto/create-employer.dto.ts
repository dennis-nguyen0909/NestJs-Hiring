import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class CreateEmployerDto {
  @IsNotEmpty()
  @IsString()
  company_name: string;

  @IsNotEmpty()
  @IsMongoId()
  user_id: string;
}
