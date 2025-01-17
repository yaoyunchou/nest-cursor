import { Controller, Get, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('文章管理')
@ApiBearerAuth()
@Controller('articles')
export class ArticleController {
  @ApiOperation({ summary: '创建文章' })
  @Post()
  async createArticle() {
    // ...
  }

  @ApiOperation({ summary: '获取所有文章' })
  @Get()
  async findAll() {
    // ...
  }
} 