import {
  Controller,
  Post,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileService } from '../file/file.service';
import { UploadFileDto } from '../file/dto/upload-file.dto';

/**
 * 读书打卡文件上传控制器
 * 处理录音文件上传相关的HTTP请求
 */
@ApiTags('文件上传')
@Controller('file/upload')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReadingFileController {
  constructor(private readonly fileService: FileService) {}

  /**
   * 上传录音文件
   * @param file 上传的文件
   * @param req 请求对象，包含当前用户信息
   * @returns 文件URL
   */
  @Post('audio')
  @ApiOperation({ summary: '上传录音文件' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadFileDto })
  @UseInterceptors(FileInterceptor('file'))
  async uploadAudio(
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ): Promise<{ url: string }> {
    if (!file) {
      throw new BadRequestException('请选择要上传的文件');
    }
    const allowedMimeTypes = ['audio/mpeg', 'audio/mp3', 'audio/aac', 'audio/wav', 'audio/x-wav'];
    const allowedExtensions = ['.mp3', '.aac', '.wav'];
    const fileExtension = file.originalname.substring(file.originalname.lastIndexOf('.')).toLowerCase();
    if (!allowedMimeTypes.includes(file.mimetype) && !allowedExtensions.includes(fileExtension)) {
      throw new BadRequestException('不支持的文件格式，仅支持 mp3、aac、wav 格式');
    }
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('文件大小不能超过 10MB');
    }
    const userId = req?.user?.userId ? parseInt(req.user.userId, 10) : undefined;
    if (userId === undefined) {
      throw new BadRequestException('用户ID不存在');
    }
    const fileEntity = await this.fileService.upload(file, userId);
    return {
      url: fileEntity.url,
    };
  }
}

