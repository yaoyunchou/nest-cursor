import { Controller, Get, Post, Body, Param, UseGuards, Delete, Query,Request, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TargetService } from './target.service';
import { CreateTargetDto } from './dto/create-target.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateTargetTaskDto } from './dto/create-target-task.dot';
import { UpdateTargetTaskDto } from './dto/update-target-task.dot';

/**
 * 目标控制器
 * 处理与目标相关的HTTP请求
 */
@ApiTags('目标')
@Controller('target')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TargetController {
  constructor(private readonly targetService: TargetService) {}

  /**
   * 创建新目标
   * @param createTargetDto - 目标创建数据
   * @param req - 请求对象，包含当前用户信息
   * @returns 创建的目标实体
   */
  @Post()
  @ApiOperation({ summary: '创建目标' })
  create(@Body() createTargetDto: CreateTargetDto, @Request() req) {
    const userId = req?.user?.userId ? parseInt(req.user.userId, 10) : undefined;
    // 如果userId为undefined，则抛出错误
    if (userId === undefined) {
      throw new Error('用户ID不存在');
    }
    createTargetDto.userId = userId;
    return this.targetService.create(createTargetDto, userId);
  }

  /**
   * 获取所有目标
   * @returns 目标列表
   */
  @Get('list')
  @ApiOperation({ summary: '获取当前用户所有目标' })
  findAll(@Query() query: {pageSize?: number, pageIndex?: number, name?: string, status?: string}, @Request() req) {
    const userId = req?.user?.userId ? parseInt(req.user.userId, 10) : undefined;
    if (userId === undefined) {
      throw new Error('用户ID不存在');
    }
    return this.targetService.findAll(query, userId);
  }

  /**
   * 获取指定ID的目标
   * @param id - 目标ID
   * @returns 目标实体
   */
  @Get(':id')
  @ApiOperation({ summary: '获取指定目标' })
  findOne(@Param('id') id: string) {
    return this.targetService.findOne(+id);
  }
  /**
   *  删除目标  
   *  希望能同时同步删除目标下的任务
   * @param id - 目标ID
   * @returns 删除结果
   */
  @Delete(':id')
  @ApiOperation({ summary: '删除目标' })
  delete(@Param('id') id: string) {
    return this.targetService.delete(+id);
  }

  /**
   * 修改目标信息
   * @param id - 目标ID
   * @param updateTargetDto - 更新目标数据
   * @returns 更新后的目标实体
   */
  @Put(':id')
  @ApiOperation({ summary: '修改目标信息' })
  update(@Param('id') id: string, @Body() updateTargetDto: CreateTargetDto) {
    return this.targetService.update(+id, updateTargetDto);
  }

  /**
   *  用户目标汇总
   * @param userId - 用户ID
   * @returns 用户目标汇总
   */
  @Get('/user/summary')
  @ApiOperation({ summary: '用户目标汇总' })
  summary(@Request() req) {
    const userId = parseInt(req?.user?.userId, 10);
    if (!userId) {
      throw new Error('无效的用户ID');
    }
    return this.targetService.summary(userId);
  }
} 