import { BadRequestException, Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';
import { Express } from 'express';
import * as multer from 'multer';
import * as path from 'path';

@Injectable()
export class CloudinaryService {
  private readonly allowedFormats = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
  ]; // Định dạng được phép
  private readonly maxFileSize = 2 * 1024 * 1024; // Giới hạn kích thước file (2MB)

  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  // Upload một file
  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'hiring/images', // Thêm tham số folder, mặc định là 'hiring/images'
  ): Promise<{ url: string; originalName: string; result: any }> {
    return new Promise<{ url: string; originalName: string; result: any }>(
      (resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: folder, // Chỉ định thư mục trong Cloudinary
          },
          (error, result) => {
            if (error) {
              console.error('Upload error:', error);
              return reject(error);
            }
            resolve({
              url: result.url,
              originalName: file.originalname,
              result: result,
            });
          },
        );

        streamifier.createReadStream(file.buffer).pipe(uploadStream);
      },
    );
  }

  // Upload nhiều file
  async uploadFiles(
    files: Express.Multer.File[],
    folder: string = 'hiring/images', // Thêm tham số folder cho hàm uploadFiles
  ): Promise<{ url: string; originalName: string }[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided.');
    }

    for (const file of files) {
      if (!this.allowedFormats.includes(file.mimetype)) {
        throw new BadRequestException(
          `Invalid file format: ${file.originalname}`,
        );
      }
      if (file.size > this.maxFileSize) {
        throw new BadRequestException(
          `File size too large: ${file.originalname}`,
        );
      }
    }

    const uploadPromises = files.map((file) => this.uploadFile(file, folder)); // Truyền folder vào
    return Promise.all(uploadPromises);
  }

  // Xóa file (bằng publicId)
  async deleteFile(publicId: string): Promise<any> {
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: 'raw',
      });
      return result;
    } catch (error) {
      console.error('Error deleting file by publicId:', error);
      throw new BadRequestException(error.message || 'Error deleting file');
    }
  }

  async deleteFileResourceType(
    publicId: string,
    options: { resource_type: string },
  ): Promise<any> {
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: options.resource_type,
      });
      return result;
    } catch (error) {
      console.error(
        'Error deleting file by publicId with resource type:',
        error,
      );
      throw new BadRequestException(error.message || 'Error deleting file');
    }
  }

  async deleteMultipleFiles(
    publicIds: string[],
    options: { resource_type: string },
  ): Promise<{
    successes: { publicId: string; status: string }[];
    failures: { publicId: string; status: string; error?: any }[];
  }> {
    const results = await Promise.all(
      publicIds.map(async (publicId) => {
        try {
          const res = await cloudinary.uploader.destroy(publicId, {
            resource_type: options.resource_type,
          });
          return res.result === 'ok'
            ? { publicId, status: 'deleted' }
            : { publicId, status: 'failed' };
        } catch (error) {
          return { publicId, status: 'failed', error };
        }
      }),
    );

    const successes = results.filter((res) => res.status === 'deleted');
    const failures = results.filter((res) => res.status === 'failed');

    return {
      successes,
      failures,
    };
  }

  async uploadPDF(
    file: Express.Multer.File,
    userId: string,
    folder: string = 'hiring/pdf',
  ): Promise<{
    originalName: string;
    result: {
      public_id: string;
      url: string;
      bytes: number;
      asset_id: string;
    };
  }> {
    return new Promise((resolve, reject) => {
      if (!userId) {
        throw new BadRequestException('userId is required');
      }
      const fileNameWithoutExt = path.parse(file.originalname).name;
      const timestamp = Date.now();
      const uniqueFileName = `${fileNameWithoutExt}_${timestamp}`;

      // Tạo folder theo userId: hiring/pdf/<userId>
      const fullPublicId = `${folder}/${userId}/${uniqueFileName}`;

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
          format: 'pdf',
          public_id: fullPublicId,
          overwrite: false,
          use_filename: false,
          unique_filename: false,
        },
        (error, result) => {
          if (error) {
            console.error('PDF upload error:', error);
            return reject(error);
          }
          if (!result) {
            console.error('No result returned');
            return reject(new Error('No result returned from Cloudinary'));
          }
          resolve({
            originalName: uniqueFileName,
            result: {
              public_id: result.public_id,
              url: result.secure_url,
              bytes: result.bytes,
              asset_id: result.asset_id,
              ...result,
            },
          });
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async getFolder(
    folder: string,
    type: string,
    resource_type: string,
  ): Promise<any> {
    try {
      if (type !== 'upload') {
        throw new BadRequestException(
          'Invalid type. Allowed types are "upload"',
        );
      }
      if (!['image', 'raw', 'video'].includes(resource_type)) {
        throw new BadRequestException(
          'Invalid type. Allowed types are "image", "raw", or "video".',
        );
      }
      const result = await cloudinary.api.resources({
        type: type,
        resource_type: resource_type,
        prefix: folder,
        max_results: 500,
      });
      return result;
    } catch (error) {
      console.error('Error fetching folder contents:', error);
      throw error;
    }
  }

  async renamePDF(
    oldPublicId: string,
    newFileName: string,
    userId: string,
  ): Promise<any> {
    try {
      const folder = oldPublicId.substring(0, oldPublicId.lastIndexOf('/'));
      const newPublicId = `${folder}/${userId}/${newFileName}`;
      const result = await cloudinary.uploader.rename(
        oldPublicId,
        newPublicId,
        {
          resource_type: 'raw',
          overwrite: true,
        },
      );
      return result;
    } catch (error) {
      console.error('Error renaming PDF:', error);
      throw new BadRequestException(error);
    }
  }
}
