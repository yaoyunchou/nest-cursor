import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ErrorBookService } from './errorbook.service';
import { CreateErrorBookDto } from './dto/create-errorbook.dto';
import { UpdateErrorBookDto } from './dto/update-errorbook.dto';
import { QueryErrorBookDto } from './dto/query-errorbook.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * 错题本控制器
 * 处理错题本相关的HTTP请求
 */
@ApiTags('错题本')
@Controller('errorbook')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ErrorBookController {
  constructor(private readonly errorBookService: ErrorBookService) {}

  /**
   * 创建错题记录
   * @param createErrorBookDto - 错题创建数据
   * @param req - 请求对象，包含当前用户信息
   * @returns 创建的错题实体
   */
  @Post()
  @ApiOperation({ summary: '创建错题记录' })
  create(@Body() createErrorBookDto: CreateErrorBookDto, @Request() req) {
    const userId = req?.user?.userId ? parseInt(req.user.userId, 10) : undefined;
    if (userId === undefined) {
      throw new Error('用户ID不存在');
    }
    return this.errorBookService.create(createErrorBookDto, userId);
  }

  /**
   * 分页查询错题列表
   * @param query - 查询参数
   * @param req - 请求对象，包含当前用户信息
   * @returns 分页后的错题列表
   */
  @Get()
  @ApiOperation({ summary: '获取错题列表' })
  findAll(@Query() query: QueryErrorBookDto, @Request() req) {
    const userId = req?.user?.userId ? parseInt(req.user.userId, 10) : undefined;
    if (userId === undefined) {
      throw new Error('用户ID不存在');
    }
    return this.errorBookService.findAll(query, userId);
  }

  /**
   * 根据ID查询单个错题
   * @param id - 错题ID
   * @param req - 请求对象，包含当前用户信息
   * @returns 错题实体
   */
  @Get(':id')
  @ApiOperation({ summary: '获取错题详情' })
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const userId = req?.user?.userId ? parseInt(req.user.userId, 10) : undefined;
    if (userId === undefined) {
      throw new Error('用户ID不存在');
    }
    return this.errorBookService.findOne(id, userId);
  }

  /**
   * 更新错题记录
   * @param id - 错题ID
   * @param updateErrorBookDto - 更新数据
   * @param req - 请求对象，包含当前用户信息
   * @returns 更新后的错题实体
   */
  @Put(':id')
  @ApiOperation({ summary: '更新错题记录' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateErrorBookDto: UpdateErrorBookDto,
    @Request() req,
  ) {
    const userId = req?.user?.userId ? parseInt(req.user.userId, 10) : undefined;
    if (userId === undefined) {
      throw new Error('用户ID不存在');
    }
    return this.errorBookService.update(id, updateErrorBookDto, userId);
  }

  /**
   * 删除错题记录
   * @param id - 错题ID
   * @param req - 请求对象，包含当前用户信息
   */
  @Delete(':id')
  @ApiOperation({ summary: '删除错题记录' })
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const userId = req?.user?.userId ? parseInt(req.user.userId, 10) : undefined;
    if (userId === undefined) {
      throw new Error('用户ID不存在');
    }
    return this.errorBookService.remove(id, userId);
  }
  /**
   * errorbook/statistics/summary
   * 1. 总错题数量, 本周新增， 本月新增， 今日新增
   * 2. 返回数据结构
   * {
   *   total: 总错题数量,
   *   week: 本周新增,
   *   month: 本月新增,
   *   today: 今日新增,
   * }
   * 
   */
  @Get('statistics/summary')
  @ApiOperation({ summary: '获取错题本统计概览' })
  getStatisticsSummary(@Request() req) {
    const userId = req?.user?.userId ? parseInt(req.user.userId, 10) : undefined;
    if (userId === undefined) {
      throw new Error('用户ID不存在');
    }
    return this.errorBookService.getStatisticsSummary(userId);
  }
}

