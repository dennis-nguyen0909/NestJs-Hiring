import { BadRequestException, Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  private readonly allowedFormats = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
  ]; // Định dạng được phép
  private readonly maxFileSize = 2 * 1024 * 1024; // Giới hạn kích thước file (2MB)

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

  // Xóa file
  async deleteFile(publicId: string) {
    return await cloudinary.uploader.destroy(publicId);
  }

  async deleteFileResourceType(
    publicId: string,
    options: { resource_type: string },
  ) {
    return await cloudinary.uploader.destroy(publicId, {
      resource_type: options.resource_type,
    });
  }

  async deleteMultipleFiles(
    publicIds: string[],
    options: { resource_type: string },
  ) {
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

  // Upload PDF
  async uploadPDF(
    file: Express.Multer.File,
    folder: string = 'hiring/pdf', // Thêm tham số folder cho uploadPDF
  ): Promise<{ url: string; originalName: string; result: any }> {
    return new Promise<{ url: string; originalName: string; result: any }>(
      (resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: 'raw',
            folder: folder, // Chỉ định thư mục cho file PDF
          },
          (error, result) => {
            if (error) {
              console.error('PDF upload error:', error);
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

  async getFolder(folder: string, type: string, resource_type: string) {
    try {
      // Lấy danh sách tài nguyên trong thư mục với loại tài nguyên (type) xác định
      if (type !== 'upload') {
        throw new BadRequestException(
          'Invalid type. Allowed types are "upload"',
        );
      }
      if (
        resource_type !== 'image' &&
        resource_type !== 'raw' &&
        resource_type !== 'video'
      ) {
        throw new BadRequestException(
          'Invalid type. Allowed types are "image", "raw", or "video".',
        );
      }
      const result = await cloudinary.api.resources({
        type: type, // Loại tài nguyên như 'image', 'raw', 'video', v.v.
        resource_type: resource_type,
        prefix: folder, // Thư mục bạn muốn kiểm tra
        max_results: 500, // Giới hạn số lượng tài nguyên trả về (có thể thay đổi theo nhu cầu)
      });
      console.log(result);
      return result;
    } catch (error) {
      console.error('Error fetching folder contents:', error);
      throw error;
    }
  }
}
