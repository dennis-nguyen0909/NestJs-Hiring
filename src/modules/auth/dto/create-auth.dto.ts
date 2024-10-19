import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateAuthDto {
  @ApiProperty({
    type: String,
    description: 'The username of the user',
    example: 'dennis nguyen',
  })
  @IsNotEmpty({ message: 'username is required.' })
  username: string;
  @ApiProperty({
    type: String,
    description: 'The password of the user',
    example: '***********',
  })
  @IsNotEmpty({ message: 'password is required.' })
  password: string;
}
