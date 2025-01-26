import { Controller, Get, Post, Body, Param, UseGuards, Delete, Query,Request, BadRequestException } from '@nestjs/common';
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
@Controller('targetTask')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TargetTaskController {
  constructor(private readonly targetService: TargetService) {}

  /**
   * 创建新任务
   * @param targetId - 目标ID
   * @param createTaskDto - 任务创建数据
   * @returns 创建的任务实体
   */
  @Post(':targetId')
  @ApiOperation({ summary: '创建任务' })
  async createTask(@Request() req, @Param('targetId') targetId: string, @Body() createTargetTaskDto: CreateTargetTaskDto, ) {
    if(req?.user?.userId) {
      createTargetTaskDto.userId = req?.user?.userId;
    }

   

    return this.targetService.createTask(+targetId, createTargetTaskDto);
  }

  /**
   * 删除任务
   * @param targetId - 目标ID
   * @param taskId - 任务ID
   * @returns 删除结果
   */
  @Delete(':taskId')
  @ApiOperation({ summary: '删除任务' })
  deleteTask(@Param('targetId') targetId: string, @Param('taskId') taskId: string) {
    return this.targetService.deleteTask(+targetId, +taskId);
  }

  /**
   * 获取任务列表
   * @param query - 查询参数, 包含pageSize, pageIndex, name, status, targetId
   * @returns 任务列表
   */
  @Get('list')
  @ApiOperation({ summary: '获取任务列表' })
  findAllTasks(@Query() query: {pageSize?: number, userId?: number, pageIndex?: number, name?: string, targetId?: number}) {
    return this.targetService.findAllTasks(query);
  }

  /**
   * 获取指定ID的任务
   * @param targetId - 目标ID
   * @param taskId - 任务ID
   * @returns 任务实体
   */
  @Get('/info/:taskId')
  @ApiOperation({ summary: '获取指定任务' })
  findOneTask(@Param('targetId') targetId: string, @Param('taskId') taskId: string) {
    return this.targetService.findOneTask(+targetId, +taskId);
  }
} 