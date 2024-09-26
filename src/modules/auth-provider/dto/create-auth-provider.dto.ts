import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAuthProviderDto {
  @IsString()
  @IsNotEmpty()
  provider_name: string;
  @IsString()
  @IsNotEmpty()
  provider_id: string;
}
