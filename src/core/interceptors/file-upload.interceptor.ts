import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

export const imageUploadConfig = {
  storage: diskStorage({
    destination: './uploads/images',
    filename: (req, file, callback) => {
      const randomName = Array(32)
        .fill(null)
        .map(() => Math.round(Math.random() * 16).toString(16))
        .join('');
      callback(null, `${randomName}${extname(file.originalname)}`);
    },
  }),
  fileFilter: (req, file, callback) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return callback(new Error('只支持上传 jpg、jpeg、png、gif 格式的图片文件！'), false);
    }
    callback(null, true);
  },
  limits: {
    fileSize: 1024 * 1024 * 50, // 50MB
  },
}; 