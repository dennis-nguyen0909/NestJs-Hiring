import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cities } from './schema/Cities.schema';
import { ICitiesService } from './cities.interface';

@Injectable()
export class CitiesService implements ICitiesService {
  constructor(@InjectModel('Cities') private citiesModel: Model<Cities>) {}

  create(createCityDto: CreateCityDto): Promise<Cities> {
    const newCity = new this.citiesModel(createCityDto);
    return newCity.save();
  }

  async findAll(depth: number): Promise<any> {
    if (+depth === 1) {
      const res = await this.citiesModel.find().lean().exec();
      return res.map((city) => ({
        ...city,
        districts: [], // districts trống
      }));
    } else if (+depth === 2) {
      const res = await this.citiesModel
        .find()
        .populate({
          path: 'districts',
          select: 'name codename code',
        })
        .lean()
        .exec();

      return res.map((city) => ({
        ...city,
        districts: city.districts.map((district) => ({
          ...district,
          wards: [],
        })),
      }));
    } else {
      const res = await this.citiesModel
        .find()
        .populate({
          path: 'districts',
          select: 'name wards codename cosde',
          populate: {
            path: 'wards',
            select: 'name code codename',
          },
        })
        .lean()
        .exec();

      return res;
    }
  }

  // Tìm thành phố theo code
  async findByCode(code: number): Promise<Cities> {
    const city = await this.citiesModel
      .findOne({ code })
      .populate({
        path: 'districts',
        select: 'name codename code',
      })
      .exec();

    if (!city) {
      throw new NotFoundException(`City with code ${code} not found`);
    }

    // Ghi đè `wards` thành mảng rỗng cho mỗi `districts`
    if (city.districts && city.districts.length > 0) {
      city.districts = city.districts.map((district) => ({
        ...district,
        wards: [], // Gán mảng rỗng cho wards
      }));
    }

    return city;
  }

  async findOne(query: any): Promise<Cities | null> {
    return await this.citiesModel.findOne(query).exec();
  }

  async update(id: string, updateCityDto: UpdateCityDto): Promise<Cities> {
    const updatedCity = await this.citiesModel
      .findByIdAndUpdate(id, updateCityDto, {
        new: true,
      })
      .exec();
    if (!updatedCity) {
      throw new NotFoundException(`City with ID ${id} not found`);
    }
    return updatedCity;
  }

  async remove(id: string): Promise<{ message: string }> {
    const result = await this.citiesModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`City with ID ${id} not found`);
    }
    return { message: 'City successfully deleted' };
  }
  async findDistrictsByCityId(cityId: string): Promise<Cities> {
    const city = await this.citiesModel
      .findOne({ _id: cityId })
      .populate({
        path: 'districts',
        select: 'name codename code',
      })
      .exec();

    if (!city) {
      throw new NotFoundException(`City with code ${cityId} not found`);
    }

    // Ghi đè `wards` thành mảng rỗng cho mỗi `districts`
    if (city.districts && city.districts.length > 0) {
      city.districts = city.districts.map((district) => ({
        ...district,
        wards: [], // Gán mảng rỗng cho wards
      }));
    }

    return city;
  }
}
