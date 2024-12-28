import { Meta } from '../types';
import { CreateIndustryTypeDto } from './dto/create-industry_type.dto';
import { UpdateIndustryTypeDto } from './dto/update-industry_type.dto';
import { IndustryType } from './schema/industry_type.schema';

export interface IIndustryTypeService {
  create(createDto: CreateIndustryTypeDto): Promise<IndustryType>;
  findAll(
    query: string,
    current: number,
    pageSize: number,
  ): Promise<{
    items: IndustryType[];
    meta: Meta;
  }>;
  findOne(id: string): Promise<IndustryType>;
  update(id: string, updateDto: UpdateIndustryTypeDto): Promise<IndustryType>;
  remove(ids: string[]): Promise<[]>;
}
