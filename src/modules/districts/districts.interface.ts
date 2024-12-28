import { District } from './schema/District.schema';
import { NotFoundException } from '@nestjs/common';

export interface IDistrictsService {
  getWardsByDictrictId(
    districtId: string,
  ): Promise<District | NotFoundException>;
  getAll(): Promise<District[]>;
}
