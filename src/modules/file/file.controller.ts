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
  Request
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileService } from './file.service';
import { File } from './entities/file.entity';
import { QueryFileDto } from './dto/query-file.dto';
import { UploadFileDto } from './dto/upload-file.dto';
import { PaginatedResponse } from '../../shared/interfaces/pagination.interface';

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
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ): Promise<File> {
    // 获取用户id
    return this.fileService.upload(file, req.user.userId);
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
    return this.fileService.remove(id, req.user.id);
  }

  @ApiOperation({ summary: '获取上传Token' })
  @Get('upload/token')
  getUploadToken(): string {
    return this.fileService.getUploadToken();
  }
} 