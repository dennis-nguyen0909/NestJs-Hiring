import { IsArray } from 'class-validator';

export class DeleteAuthProviderDTO {
  @IsArray()
  ids: Array<string>;
}
