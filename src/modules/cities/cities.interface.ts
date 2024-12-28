import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { Cities } from './schema/Cities.schema';

export interface ICitiesService {
  create(createCityDto: CreateCityDto): Promise<Cities>;
  findAll(depth: number): Promise<Cities[]>;
  findByCode(code: number): Promise<Cities>;
  findOne(query: any): Promise<Cities | null>;
  update(id: string, updateCityDto: UpdateCityDto): Promise<Cities>;
  remove(id: string): Promise<{ message: string }>;
  findDistrictsByCityId(cityId: string): Promise<Cities>;
}
