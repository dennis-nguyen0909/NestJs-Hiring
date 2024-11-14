import { Injectable } from '@nestjs/common';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cities } from './schema/Cities.schema';

@Injectable()
export class CitiesService {
  constructor(
    @InjectModel('Cities')
    private citiesModel: Model<Cities>,
  ) {}
  create(createCityDto: CreateCityDto) {
    return 'This action adds a new city';
  }

  async findAll(depth: number): Promise<any[]> {
    // Truy vấn tất cả thành phố từ cơ sở dữ liệu
    // return await this.findNoDistricts();
    return this.citiesModel.find();
  }

  async findByCode(code: number): Promise<any[]> {
   return [];
  }

  async findNoDistricts() {
    const cities = await this.citiesModel.find().exec();
    return cities.map((city) => ({
      name: city.name,
      code: city.code,
      division_type: city.division_type,
      codename: city.codename,
      phone_code: city.phone_code,
      districts: [], // Đảm bảo trả về districts rỗng
    }));
  }

  async findWithDistrictsAndEmptyWards(): Promise<any[]> {
   return []
  }
  findOne(id: number) {
    return `This action returns a #${id} city`;
  }

  update(id: number, updateCityDto: UpdateCityDto) {
    return `This action updates a #${id} city`;
  }

  remove(id: number) {
    return `This action removes a #${id} city`;
  }
}
