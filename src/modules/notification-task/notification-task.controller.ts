/*
 * @Author: yaoyc yaoyunchou@bananain.com
 * @Date: 2025-01-23
 * @Description: 通知任务控制器
 */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationTaskService } from './notification-task.service';
import { CreateNotificationTaskDto } from './dto/create-notification-task.dto';
import { UpdateNotificationTaskDto } from './dto/update-notification-task.dto';
import { QueryNotificationTaskDto } from './dto/query-notification-task.dto';
import { NotificationService } from './services/notification.service';
import { NotificationTask } from './entities/notification-task.entity';
import { Roles, UserRole } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UseGuards } from '@nestjs/common';

/**
 * 通知任务控制器
 */
@ApiTags('通知任务管理')
@ApiBearerAuth()
@Controller('notification-task')
@UseGuards(RolesGuard)
export class NotificationTaskController {
  constructor(
    private readonly taskService: NotificationTaskService,
    private readonly notificationService: NotificationService,
  ) {}

  @Post()
  @ApiOperation({ summary: '创建通知任务' })
  @ApiResponse({ status: 201, description: '创建成功', type: NotificationTask })
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async create(@Body() createDto: CreateNotificationTaskDto): Promise<NotificationTask> {
    return await this.taskService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: '查询通知任务列表' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @Roles(UserRole.ADMIN, UserRole.EDITOR, UserRole.USER)
  async findAll(@Query() query: QueryNotificationTaskDto) {
    return await this.taskService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '查询通知任务详情' })
  @ApiResponse({ status: 200, description: '查询成功', type: NotificationTask })
  @ApiResponse({ status: 404, description: '任务不存在' })
  @Roles(UserRole.ADMIN, UserRole.EDITOR, UserRole.USER)
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<NotificationTask> {
    return await this.taskService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新通知任务' })
  @ApiResponse({ status: 200, description: '更新成功', type: NotificationTask })
  @ApiResponse({ status: 404, description: '任务不存在' })
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateNotificationTaskDto,
  ): Promise<NotificationTask> {
    return await this.taskService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除通知任务' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '任务不存在' })
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    await this.taskService.remove(id);
    return { message: '删除成功' };
  }

  @Post(':id/pause')
  @ApiOperation({ summary: '暂停通知任务' })
  @ApiResponse({ status: 200, description: '暂停成功', type: NotificationTask })
  @ApiResponse({ status: 404, description: '任务不存在' })
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async pause(@Param('id', ParseIntPipe) id: number): Promise<NotificationTask> {
    return await this.taskService.pause(id);
  }

  @Post(':id/resume')
  @ApiOperation({ summary: '恢复通知任务' })
  @ApiResponse({ status: 200, description: '恢复成功', type: NotificationTask })
  @ApiResponse({ status: 404, description: '任务不存在' })
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async resume(@Param('id', ParseIntPipe) id: number): Promise<NotificationTask> {
    return await this.taskService.resume(id);
  }

  @Post(':id/execute')
  @ApiOperation({ summary: '手动执行通知任务（测试用）' })
  @ApiResponse({ status: 200, description: '执行成功' })
  @ApiResponse({ status: 404, description: '任务不存在' })
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async execute(@Param('id', ParseIntPipe) id: number): Promise<{ success: boolean; message?: string; data?: any }> {
    const task = await this.taskService.findOne(id);
    return await this.notificationService.send(task);
  }
}

