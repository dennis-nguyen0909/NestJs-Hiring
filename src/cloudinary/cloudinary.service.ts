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

  async uploadFile(
    file: Express.Multer.File,
  ): Promise<{ url: string; originalName: string, result: any }> {
    return new Promise<{ url: string; originalName: string; result: any }>(
      (resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          (error, result) => {
            if (error) return reject(error);
            console.log('result', result);
            // Resolve with URL and original file name
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

  async uploadFiles(
    files: Express.Multer.File[],
  ): Promise<{ url: string; originalName: string }[]> {
    // Kiểm tra nếu không có file nào được upload
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided.');
    }

    // Duyệt qua từng file và kiểm tra kích thước, định dạng
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

    // Upload tất cả các file và trả về danh sách URL
    const uploadPromises = files.map((file) => this.uploadFile(file));
    return Promise.all(uploadPromises);
  }

  async deleteFile(publicId: string) {
    return await cloudinary.uploader.destroy(publicId);
  }
}
