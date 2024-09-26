import { Injectable } from '@nestjs/common';
import { CreateEmployerDto } from './dto/create-employer.dto';
import { UpdateEmployerDto } from './dto/update-employer.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Employer } from './schema/Employer.schema';

@Injectable()
export class EmployerService {
  constructor(
    @InjectModel('Employer') private readonly employerModel: Model<Employer>,
  ) {}
  async create(createEmployerDto: CreateEmployerDto) {
    const { company_name, user_id } = createEmployerDto;
    const createdEmployer = await this.employerModel.create({
      company_name,
      user_id,
    });
    return createdEmployer;
  }

  findAll() {
    return `This action returns all employer`;
  }

  findOne(id: number) {
    return `This action returns a #${id} employer`;
  }

  update(id: number, updateEmployerDto: UpdateEmployerDto) {
    return `This action updates a #${id} employer`;
  }

  remove(id: number) {
    return `This action removes a #${id} employer`;
  }
}
