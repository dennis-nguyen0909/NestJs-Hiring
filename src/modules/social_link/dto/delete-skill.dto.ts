import { IsArray, IsNotEmpty } from 'class-validator';

export class DeleteSocialLink {
  @IsArray()
  @IsNotEmpty()
  ids: Array<string>;
}
