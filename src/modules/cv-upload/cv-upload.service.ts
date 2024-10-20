import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { CVUploads } from './schema/CvUploads.schema';
import { UsersService } from '../users/users.service';
import { v4 as uuidv4 } from 'uuid';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import aqp from 'api-query-params';

@Injectable()
export class CvUploadService {
  constructor(
    @InjectModel('CVUploads') private uploadCvModel: Model<CVUploads>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly userService: UsersService,
  ) {}
  async create(file: Express.Multer.File, userId: string) {
    console.log('userId', userId);
    const findUser = await this.userService.findOne(userId);
    console.log('findUser', findUser);
    if (!findUser) {
      throw new BadRequestException('User not found');
    }
    if (!file) {
      throw new BadRequestException('File not found');
    }
    const uploadOnCloud = await this.cloudinaryService.uploadFile(file);
    console.log('uploadOnCloud', uploadOnCloud);
    if (!uploadOnCloud) {
      throw new BadRequestException('Upload on cloud failed');
    }
    const newCv = new this.uploadCvModel({
      file_name: file.originalname,
      cv_url: uploadOnCloud.url,
      user_id: findUser._id,
      cv_id: uuidv4(),
      public_id: uploadOnCloud?.result?.public_id,
    });
    const result = await newCv.save();
    return result;
  }

  async findOne(id: string) {
    const res = await this.uploadCvModel.findById(id);
    if (!res) {
      throw new BadRequestException('Cv not found');
    } else {
      return res;
    }
  }
  async findByUserId(id: string) {
    let objectId;
    try {
      objectId = new Types.ObjectId(id);
    } catch (error) {
      throw new BadRequestException(`Invalid user ID format ${error}`);
    }

    const res = await this.uploadCvModel.find({ user_id: objectId });
    if (res.length === 0) {
      throw new BadRequestException('CV not found');
    } else {
      return res;
    }
  }
  async findAll(query: string, current: number, pageSize: number) {
    const { filter, sort } = aqp(query);
    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;
    if (!current) current = 1;
    if (!pageSize) pageSize = 10;
    const totalItems = (await this.uploadCvModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (+current - 1) * pageSize;
    const result = await this.uploadCvModel
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
  async removeByUserId(cvId: string, userId: string) {
    // Convert the user ID and CV ID to ObjectId
    // Validate cvId and userId
    if (!Types.ObjectId.isValid(cvId)) {
      throw new BadRequestException('Invalid CV ID format');
    }

    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid User ID format');
    }

    // Convert the user ID and CV ID to ObjectId
    const objectId = new Types.ObjectId(cvId);
    const userObjectId = new Types.ObjectId(userId);

    // Find the CV to check ownership
    try {
      const cv = await this.uploadCvModel.findOne({
        _id: objectId,
        user_id: userObjectId,
      });

      if (!cv) {
        throw new BadRequestException(
          'CV not found or user does not have permission to delete it',
        );
      }
      const res = await this.uploadCvModel.deleteOne({ _id: objectId });

      if (res.deletedCount > 0) {
        const deleteCloud = await this.cloudinaryService.deleteFile(
          cv.public_id,
        );
        if (deleteCloud.result === 'ok') {
          return [];
        }
      } else {
        throw new BadRequestException('Failed to delete the CV');
      }
    } catch (error) {
      // Handle unexpected errors gracefully
      throw new BadRequestException(
        'An error occurred while deleting the CV: ' + error.message,
      );
    }
  }

  async removeMany(ids: Array<string>) {
    try {
      if (ids.length === 1) {
        const res = await this.uploadCvModel.deleteOne({ _id: ids[0] });

        if (res.deletedCount > 0) {
          return [];
        } else {
          throw new BadRequestException('Cv not found');
        }
      } else {
        const res = await this.uploadCvModel.deleteMany({ _id: { $in: ids } });
        if (res.deletedCount > 0) {
          return [];
        } else {
          throw new BadRequestException('Cv not found');
        }
      }
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
