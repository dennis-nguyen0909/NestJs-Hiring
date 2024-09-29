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

  async uploadFile(file: Express.Multer.File): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        (error, result) => {
          if (error) return reject(error);
          resolve(result.url); // Chỉ trả về URL của hình ảnh đã tải lên
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async uploadFiles(files: Express.Multer.File[]): Promise<string[]> {
    // Kiểm tra nếu không có file nào được upload
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided.');
    }
    console.log('files', files);

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
}
