import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CompanyApplicationStatus } from './schema/CompanyApplicationStatus.schema';
import { CreateCompanyStatusDto } from './dto/create-company-status.dto';
import { UpdateCompanyStatusDto } from './dto/update-company-status.dto';

@Injectable()
export class CompanyStatusService {
  constructor(
    @InjectModel(CompanyApplicationStatus.name)
    private companyStatusModel: Model<CompanyApplicationStatus>,
  ) {}

  async create(companyId: string, createDto: CreateCompanyStatusDto) {
    const status = new this.companyStatusModel({
      ...createDto,
      company_id: new Types.ObjectId(companyId),
    });
    return await status.save();
  }

  async findAll(companyId: string) {
    return await this.companyStatusModel
      .find({ company_id: new Types.ObjectId(companyId) })
      .sort({ order: 1 });
  }

  async findOne(id: string) {
    const status = await this.companyStatusModel.findById(id);
    if (!status) {
      throw new NotFoundException('Status not found');
    }
    return status;
  }

  async update(id: string, updateDto: UpdateCompanyStatusDto) {
    const status = await this.companyStatusModel.findByIdAndUpdate(
      id,
      updateDto,
      { new: true },
    );
    if (!status) {
      throw new NotFoundException('Status not found');
    }
    return status;
  }

  async remove(id: string) {
    const status = await this.companyStatusModel.findByIdAndDelete(id);
    if (!status) {
      throw new NotFoundException('Status not found');
    }
    return status;
  }

  async getDefaultStatus(companyId: string) {
    const status = await this.companyStatusModel.findOne({
      company_id: new Types.ObjectId(companyId),
      name: 'Pending',
    });
    if (!status) {
      throw new NotFoundException('No Pending status found for company');
    }
    return status;
  }
}
