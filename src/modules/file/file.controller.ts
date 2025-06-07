/*
 * @Author: yaoyc yaoyunchou@bananain.com
 * @Date: 2025-01-18 10:00:44
 * @LastEditors: yaoyc yaoyunchou@bananain.com
 * @LastEditTime: 2025-01-18 10:00:44
 * @FilePath: \nest-cursor\src\modules\file\file.controller.ts
 * @Description: 文件控制器
 */
import { 
  Controller, 
  Get, 
  Post, 
  Delete,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  UseGuards,
  Request,
  BadRequestException,
  Response as ExpressResponse,
  Res
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileService } from './file.service';
import { File } from './entities/file.entity';
import { QueryFileDto } from './dto/query-file.dto';
import { UploadFileDto } from './dto/upload-file.dto';
import { PaginatedResponse } from '../../shared/interfaces/pagination.interface';
import { Public } from '../auth/decorators/public.decorator';
import type { Response as ExpressResponseType } from 'express';

@ApiTags('文件管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @ApiOperation({ summary: '上传文件' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadFileDto })
  @Post('upload')
  @UseInterceptors(FileInterceptor('file')) // 使用文件拦截器
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ): Promise<File> {
    // 获取用户id
    return this.fileService.upload(file, req.user.userId);
  }

  // 无登陆信息文件上传 
  @ApiOperation({ summary: '无登陆信息文件上传' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadFileDto })
  @Post('upload/no-auth')
  @UseInterceptors(FileInterceptor('file')) // 使用文件拦截器
  @Public() // 将此接口加入白名单,不需要授权
  async uploadNoAuth(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<File> {
    return this.fileService.upload(file, 1);
  }


  @ApiOperation({ summary: '获取文件列表' })
  @Get('list')
  async findAll(@Query() query: QueryFileDto): Promise<PaginatedResponse<File>> {
    return this.fileService.findAll(query);
  }

  @ApiOperation({ summary: '获取文件详情' })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<File> {
    return this.fileService.findOne(id);
  }

  @ApiOperation({ summary: '删除文件' })
  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ): Promise<void> {
    return this.fileService.remove(id, req.user.userId);
  }

  @ApiOperation({ summary: '获取上传Token' })
  @Get('upload/token')
  getUploadToken(): string {
    return this.fileService.getUploadToken();
  }
  // 图片文件访问代理， 通过传入的url返回当前url返回的内容，一般是图片内容
  @ApiOperation({ summary: '图片文件访问代理' })
  @Get('coze/proxy')
  @Public() // 将此接口加入白名单,不需要授权
  async proxyImage(@Query('url') url: string, @Res() res: ExpressResponseType): Promise<void> {
    try {
      // 验证URL是否合法
      if (!url || !url.match(/^https?:\/\/.+/)) {
        throw new BadRequestException('无效的URL');
      }
      // 获取远程图片
      const fetchResponse = await fetch(url);
      if (!fetchResponse.ok || !fetchResponse.body) {
        throw new BadRequestException('获取图片失败');
      }
      res.set('Content-Type', fetchResponse.headers.get('content-type') || 'application/octet-stream');
      // Web Streams API -> Node.js stream
      const nodeStream = require('stream').Readable.fromWeb(fetchResponse.body);
      nodeStream.pipe(res);
    } catch (error) {
      throw new BadRequestException('获取图片失败');
    }
  }



} 