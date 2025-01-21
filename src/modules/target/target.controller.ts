import { Controller, Get, Post, Body, Param, UseGuards, Delete } from '@nestjs/common';
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
  findAll() {
    return this.targetService.findAll();
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
   * 创建新任务
   * @param targetId - 目标ID
   * @param createTaskDto - 任务创建数据
   * @returns 创建的任务实体
   */
  @Post(':targetId/tasks')
  @ApiOperation({ summary: '创建任务' })
  createTask(@Param('targetId') targetId: string, @Body() createTargetTaskDto: CreateTargetTaskDto) {
    return this.targetService.createTask(+targetId, createTargetTaskDto);
  }

  /**
   * 删除任务
   * @param targetId - 目标ID
   * @param taskId - 任务ID
   * @returns 删除结果
   */
  @Delete(':targetId/tasks/:taskId')
  @ApiOperation({ summary: '删除任务' })
  deleteTask(@Param('targetId') targetId: string, @Param('taskId') taskId: string) {
    return this.targetService.deleteTask(+targetId, +taskId);
  }

  /**
   * 获取目标下的所有任务
   * @param targetId - 目标ID
   * @returns 任务列表
   */
  @Get(':targetId/tasks')
  @ApiOperation({ summary: '获取目标下的所有任务' })
  findAllTasks(@Param('targetId') targetId: string) {
    return this.targetService.findAllTasks(+targetId);
  }

  /**
   * 获取指定ID的任务
   * @param targetId - 目标ID
   * @param taskId - 任务ID
   * @returns 任务实体
   */
  @Get(':targetId/tasks/:taskId')
  @ApiOperation({ summary: '获取指定任务' })
  findOneTask(@Param('targetId') targetId: string, @Param('taskId') taskId: string) {
    return this.targetService.findOneTask(+targetId, +taskId);
  }
} 