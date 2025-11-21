/*
 * @Author: yaoyc yaoyunchou@bananain.com
 * @Date: 2025-01-23
 * @Description: 通知调度服务
 */
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { NotificationTask, TaskStatus } from '../entities/notification-task.entity';
import { NotificationLog, LogStatus } from '../entities/notification-log.entity';
import { NotificationService } from './notification.service';
import { NotificationTaskService } from '../notification-task.service';

/**
 * 通知调度服务
 */
@Injectable()
export class NotificationSchedulerService implements OnModuleInit {
  private readonly logger = new Logger(NotificationSchedulerService.name);

  constructor(
    @InjectRepository(NotificationTask)
    private readonly taskRepository: Repository<NotificationTask>,
    @InjectRepository(NotificationLog)
    private readonly logRepository: Repository<NotificationLog>,
    private readonly notificationService: NotificationService,
    private readonly taskService: NotificationTaskService,
  ) {}

  /**
   * 模块初始化时记录启动日志
   */
  onModuleInit() {
    this.logger.log('通知任务调度服务已启动，定时任务每分钟检查一次待执行的任务');
  }

  /**
   * 每30分钟执行一次，检查需要执行的任务
   */
  @Cron('*/30 * * * *')  // 每30分钟执行一次
  async checkAndExecuteTasks() {
    try {
      const now = new Date();
      const tasks = await this.taskRepository.find({
        where: {
          status: TaskStatus.ACTIVE,
          nextExecuteAt: LessThanOrEqual(now),
        },
        relations: ['user'],
      });
      if (tasks.length === 0) {
        return;
      }
      this.logger.log(`找到 ${tasks.length} 个待执行的任务`);
      for (const task of tasks) {
        await this.executeTask(task);
      }
    } catch (error) {
      this.logger.error(`检查任务执行失败: ${error.message}`, error.stack);
    }
  }

  /**
   * 执行单个任务
   */
  private async executeTask(task: NotificationTask): Promise<void> {
    try {
      this.logger.log(`开始执行任务: ${task.id} - ${task.name}`);
      const result = await this.notificationService.send(task);
      const log = this.logRepository.create({
        taskId: task.id,
        userId: task.userId,
        channel: task.channel,
        status: result.success ? LogStatus.SUCCESS : LogStatus.FAILED,
        requestData: {
          channelConfig: task.channelConfig,
          content: task.content,
        },
        responseData: result.data,
        errorMessage: result.success ? null : result.message,
        executeAt: new Date(),
      });
      await this.logRepository.save(log);
      await this.taskService.updateTaskExecution(task, result.success);
      if (result.success) {
        this.logger.log(`任务执行成功: ${task.id} - ${task.name}`);
      } else {
        this.logger.warn(`任务执行失败: ${task.id} - ${task.name}, 错误: ${result.message}`);
      }
    } catch (error) {
      this.logger.error(`执行任务异常: ${task.id} - ${task.name}, 错误: ${error.message}`, error.stack);
      const log = this.logRepository.create({
        taskId: task.id,
        userId: task.userId,
        channel: task.channel,
        status: LogStatus.FAILED,
        requestData: {
          channelConfig: task.channelConfig,
          content: task.content,
        },
        responseData: null,
        errorMessage: error.message,
        executeAt: new Date(),
      });
      await this.logRepository.save(log);
      await this.taskService.updateTaskExecution(task, false);
    }
  }
}

