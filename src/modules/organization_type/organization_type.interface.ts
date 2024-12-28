import { Meta } from '../types';
import { CreateOrganizationTypeDto } from './dto/create-organization_type.dto';
import { UpdateOrganizationTypeDto } from './dto/update-organization_type.dto';
import { OrganizationType } from './schema/organization_type.schema';

export interface IOrganizationTypeService {
  create(createJobType: CreateOrganizationTypeDto): Promise<OrganizationType>;

  findAll(
    query: string,
    current: number,
    pageSize: number,
  ): Promise<{
    items: OrganizationType[];
    meta: Meta;
  }>;

  findOne(id: string): Promise<OrganizationType>;

  update(
    id: string,
    updateDto: UpdateOrganizationTypeDto,
  ): Promise<OrganizationType>;

  remove(ids: string[]): Promise<void | []>;
}
