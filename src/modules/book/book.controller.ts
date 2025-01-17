/*
 * @Author: yaoyc yaoyunchou@bananain.com
 * @Date: 2025-01-14 14:43:35
 * @LastEditors: yaoyc yaoyunchou@bananain.com
 * @LastEditTime: 2025-01-14 15:01:52
 * @FilePath: \nest-cursor\src\book\book.controller.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  UseGuards, 
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

import { FileInterceptor } from '@nestjs/platform-express';
import { imageUploadConfig } from '@/core/interceptors/file-upload.interceptor';
import { CreateBookDto } from './dto/create-book.dto';
import { BookService } from './book.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
// ... existing code ...
import { Roles, UserRole } from '../auth/roles.decorator';

@ApiTags('图书管理')
// ... rest of the code ...

@ApiTags('图书管理')
@ApiBearerAuth()
@Controller('books')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @ApiOperation({ summary: '创建图书' })
  @Post()
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @UseInterceptors(FileInterceptor('coverImage', imageUploadConfig))
  async createBook(
    @Body() createBookDto: CreateBookDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
      }),
    )
    file?: Express.Multer.File,
  ) {
    const bookData = {
      ...createBookDto,
      coverImage: file ? `/uploads/images/${file.filename}` : null,
    };
    return await this.bookService.createBook(bookData);
  }

  @ApiOperation({ summary: '获取所有图书' })
  @Get()
  @Roles(UserRole.VISITOR)
  async findAll() {
    return await this.bookService.findAll();
  }
} 