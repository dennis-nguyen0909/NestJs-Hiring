import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyAuthDto {
  @IsString()
  @IsNotEmpty()
  id: string;
  @IsString()
  @IsNotEmpty()
  code_id: string;
}
