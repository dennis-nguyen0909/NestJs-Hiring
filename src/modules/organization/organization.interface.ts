import { Meta } from '../types';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { Organization } from './schema/organization.schema';

export interface IOrganizationService {
  create(
    createOrganizationDto: CreateOrganizationDto,
    userId: string,
  ): Promise<any>;

  findAll(
    query: string,
    current: number,
    pageSize: number,
  ): Promise<{
    items: Organization[];
    meta: Meta;
  }>;

  findOne(id: string): Promise<Organization>;

  update(
    id: string,
    updateOrganizationDto: UpdateOrganizationDto,
  ): Promise<Organization>;

  remove(id: string): Promise<Organization>;

  findByOwner(ownerId: string): Promise<Organization[]>;
}
