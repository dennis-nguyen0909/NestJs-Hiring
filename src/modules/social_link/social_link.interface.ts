// src/modules/social_link/social_link.service.interface.ts

import { Meta } from '../types';
import { CreateSocialLinkDto } from './dto/create-social_link.dto';
import { DeleteSocialLink } from './dto/delete-skill.dto';
import { UpdateSocialLinkDto } from './dto/update-social_link.dto';
import { SocialLink } from './schema/social_link.schema';

export interface ISocialLinkService {
  create(data: CreateSocialLinkDto): Promise<SocialLink>;
  findAll(
    query: string,
    current: number,
    pageSize: number,
  ): Promise<{ items: SocialLink[]; meta: Meta }>;
  findOne(id: string): Promise<SocialLink>;
  update(id: string, update: UpdateSocialLinkDto): Promise<SocialLink>;
  remove(data: DeleteSocialLink): Promise<any>;
  getSocialLinkByUserId(
    userId: string,
    current: number,
    pageSize: number,
    query: string,
  ): Promise<{ items: SocialLink[]; meta: Meta }>;
  deleteByUserId(id: string, userId: string): Promise<[]>;
}
