import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDistrictDto } from './dto/create-district.dto';
import { UpdateDistrictDto } from './dto/update-district.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { District } from './schema/District.schema';

@Injectable()
export class DistrictsService {
  constructor(
    @InjectModel('District') private districtsModel: Model<District>,
  ) {}
  async getWardsByDictrictId(districtId: string) {
    const res = await this.districtsModel
      .findOne({ _id: districtId })
      .populate('wards');
    return res;
  }
  async getAll() {
    return await this.districtsModel.find({});
  }
}
