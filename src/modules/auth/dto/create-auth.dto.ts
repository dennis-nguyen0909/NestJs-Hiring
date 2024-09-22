import { IsNotEmpty } from 'class-validator';

export class CreateAuthDto {
  @IsNotEmpty({ message: 'username is required.' })
  username: string;
  @IsNotEmpty({ message: 'password is required.' })
  password: string;
}
