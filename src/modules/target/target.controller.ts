import { Controller, Get, Post, Body, Param, UseGuards, Delete, Query,Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TargetService } from './target.service';
import { CreateTargetDto } from './dto/create-target.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateTargetTaskDto } from './dto/create-target-task.dot';

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
   * @returns 创建的目标实体
   */
  @Post()
  @ApiOperation({ summary: '创建目标' })
  create(@Body() createTargetDto: CreateTargetDto) {
    return this.targetService.create(createTargetDto);
  }

  /**
   * 获取所有目标
   * @returns 目标列表
   */
  @Get('list')
  @ApiOperation({ summary: '获取所有目标' })
  findAll(@Query() query: {pageSize?: number, pageIndex?: number, name?: string, status?: string}) {
    return this.targetService.findAll(query);
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
} 