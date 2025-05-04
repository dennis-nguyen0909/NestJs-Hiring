import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Package, PackageDocument } from './package.schema';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';

@Injectable()
export class PackageService {
  constructor(
    @InjectModel(Package.name) private packageModel: Model<PackageDocument>,
  ) {}

  async create(createPackageDto: CreatePackageDto): Promise<Package> {
    const createdPackage = new this.packageModel(createPackageDto);
    return createdPackage.save();
  }

  async findAll(): Promise<Package[]> {
    return this.packageModel.find().exec();
  }

  async findOne(id: string): Promise<Package> {
    return this.packageModel.findById(id).exec();
  }

  async update(
    id: string,
    updatePackageDto: UpdatePackageDto,
  ): Promise<Package> {
    return this.packageModel
      .findByIdAndUpdate(id, updatePackageDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<Package> {
    return this.packageModel.findByIdAndDelete(id).exec();
  }

  async findActive(): Promise<Package[]> {
    return this.packageModel.find({ isActive: true }).exec();
  }
}
