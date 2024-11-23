// certificate.service.ts
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { UpdateCertificateDto } from './dto/update-certificate.dto';
import { Certificate } from './schema/certificate.schema';
import { User } from '../users/schemas/User.schema';
import aqp from 'api-query-params';
import { Meta } from '../types';


@Injectable()
export class CertificateService {
  constructor(
    @InjectModel(Certificate.name) private certificateModel: Model<Certificate>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async create(
    createCertificateDto: CreateCertificateDto,
  ): Promise<Certificate> {
    const newCertificate =
      await this.certificateModel.create(createCertificateDto);
    if (!newCertificate) {
      throw new BadRequestException('Create certificate failed');
    }
    const candidate = await this.userModel.findById(
      newCertificate.candidate_id,
    );
    if (!candidate) {
      throw new NotFoundException(
        `Candidate #${newCertificate.candidate_id} not found`,
      );
    }
    candidate.certificates.push(newCertificate._id);
    await candidate.save();
    return newCertificate;
  }

  async findOne(id: string): Promise<Certificate> {
    const certificate = await this.certificateModel
      .findById(id)
      .populate('candidate_id')
      .exec();
    if (!certificate) {
      throw new NotFoundException(`Certificate #${id} not found`);
    }
    return certificate;
  }

  async update(
    id: string,
    updateCertificateDto: UpdateCertificateDto,
  ): Promise<Certificate> {
    const updatedCertificate = await this.certificateModel.findByIdAndUpdate(
      id,
      updateCertificateDto,
      { new: true },
    );
    if (!updatedCertificate) {
      throw new NotFoundException(`Certificate #${id} not found`);
    }
    return updatedCertificate;
  }

  async remove(id: string, userId: string): Promise<void> {
    // Tìm certificate
    const certificate = await this.certificateModel.findById(id).exec();
    if (!certificate) {
      throw new NotFoundException(`Certificate #${id} not found`);
    }
    if (certificate?.candidate_id === new Types.ObjectId(userId)) {
      throw new ForbiddenException(
        'You are not allowed to delete this certificate',
      );
    }

    const result = await this.certificateModel.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      throw new BadRequestException(
        'Certificate not found or could not be deleted',
      );
    }

    await this.userModel.updateOne(
      { _id: certificate.candidate_id },
      { $pull: { certificates: id } }, 
    );
  }

  async findAll(
    query: string,
    current: number,
    pageSize: number,
  ): Promise<{ items: Certificate[]; meta: Meta }> {
    const { filter, sort } = aqp(query);
    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;

    if (!current) current = 1;
    if (!pageSize) pageSize = 10;
    const totalItems = (await this.certificateModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (+current - 1) * pageSize;
    const result = await this.certificateModel
      .find(filter)
      .limit(pageSize)
      .skip(skip)
      .sort(sort as any);
    return {
      items: result,
      meta: {
        count: result.length,
        current_page: current,
        per_page: pageSize,
        total: totalItems,
        total_pages: totalPages,
      },
    };
  }
}
