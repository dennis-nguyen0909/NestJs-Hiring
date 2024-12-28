import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDistrictDto } from './dto/create-district.dto';
import { UpdateDistrictDto } from './dto/update-district.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { District } from './schema/District.schema';
import { IDistrictsService } from './districts.interface';

@Injectable()
export class DistrictsService implements IDistrictsService {
  constructor(
    @InjectModel(District.name) private districtsModel: Model<District>,
  ) {}
  async getWardsByDictrictId(districtId: string): Promise<District> {
    const res = await this.districtsModel
      .findOne({ _id: districtId })
      .populate('wards');
    return res;
  }
  async getAll(): Promise<District[]> {
    return await this.districtsModel.find({});
  }
}
