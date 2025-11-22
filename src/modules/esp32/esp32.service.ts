/*
 * @Author: yaoyc yaoyunchou@bananain.com
 * @Date: 2025-01-18 20:00:00
 * @LastEditors: yaoyc yaoyunchou@bananain.com
 * @LastEditTime: 2025-01-18 20:00:00
 * @FilePath: \nest-cursor\src\modules\esp32\esp32.service.ts
 * @Description: ESP32芯片服务
 */
import { Injectable, NotFoundException, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Esp32 } from './entities/esp32.entity';
import { CreateEsp32Dto } from './dto/create-esp32.dto';
import { UpdateEsp32Dto } from './dto/update-esp32.dto';
import { randomUUID } from 'crypto';
import { SystemLogService } from '../system-log/system-log.service';
import { NotificationTask, TaskStatus } from '../notification-task/entities/notification-task.entity';
import { NotificationTaskService } from '../notification-task/notification-task.service';

@Injectable()
export class Esp32Service implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(Esp32Service.name);
  /**
   * 记录每个bindingId的最后请求时间
   * key: bindingId, value: 最后请求时间戳
   */
  private readonly bindingIdLastRequestTime = new Map<string, number>();
  /**
   * 定时检查间隔（毫秒），默认30秒检查一次
   */
  private readonly checkInterval = 30000;
  /**
   * 超时时间（毫秒），默认1分钟
   */
  private readonly timeoutDuration = 60000;
  /**
   * 定时器ID
   */
  private checkTimer: NodeJS.Timeout | null = null;

  constructor(
    @InjectRepository(Esp32)
    private readonly esp32Repository: Repository<Esp32>,
    @InjectRepository(NotificationTask)
    private readonly notificationTaskRepository: Repository<NotificationTask>,
    private readonly systemLogService: SystemLogService,
    private readonly notificationTaskService: NotificationTaskService,
  ) {}

  onModuleInit() {
    this.startHealthCheckTimer();
    this.logger.log(`ESP32设备健康检查定时器已启动，检查间隔：${this.checkInterval}ms，超时时间：${this.timeoutDuration}ms`);
  }

  onModuleDestroy() {
    if (this.checkTimer) {
      clearInterval(this.checkTimer);
      this.checkTimer = null;
      this.logger.log('ESP32健康检查定时器已停止');
    }
  }

  /**
   * 启动健康检查定时器
   */
  private startHealthCheckTimer(): void {
    this.checkTimer = setInterval(() => {
      this.checkTimeoutDevices().catch((error) => {
        this.logger.error(`检查超时设备失败: ${error.message}`, error.stack);
      });
    }, this.checkInterval);
  }

  /**
   * 检查超时的设备并更新关联任务状态
   */
  private async checkTimeoutDevices(): Promise<void> {
    const now = Date.now();
    const timeoutBindingIds: string[] = [];
    for (const [bindingId, lastRequestTime] of this.bindingIdLastRequestTime.entries()) {
      const timeSinceLastRequest = now - lastRequestTime;
      if (timeSinceLastRequest > this.timeoutDuration) {
        timeoutBindingIds.push(bindingId);
      }
    }
    if (timeoutBindingIds.length === 0) {
      return;
    }
    this.logger.log(`发现 ${timeoutBindingIds.length} 个超时设备，开始更新关联任务状态`);
    for (const bindingId of timeoutBindingIds) {
      try {
        const esp32 = await this.esp32Repository.findOne({
          where: { bindingId },
        });
        if (!esp32 || !esp32.taskId) {
          this.bindingIdLastRequestTime.delete(bindingId);
          continue;
        }
        const task = await this.notificationTaskRepository.findOne({
          where: { id: esp32.taskId },
        });
        if (!task) {
          this.logger.warn(`任务ID ${esp32.taskId} 不存在，跳过更新`);
          this.bindingIdLastRequestTime.delete(bindingId);
          continue;
        }
        if (task.status !== TaskStatus.ACTIVE) {
          task.status = TaskStatus.ACTIVE;
          task.nextExecuteAt = this.notificationTaskService.calculateNextExecuteAt(
            task.scheduleType,
            task.scheduleConfig,
          );
          await this.notificationTaskRepository.save(task);
          this.logger.log(`已将任务ID ${esp32.taskId}（绑定ID: ${bindingId}）状态更新为 ACTIVE，下次执行时间：${task.nextExecuteAt?.toISOString() || '无'}`);
        }
        this.bindingIdLastRequestTime.delete(bindingId);
      } catch (error) {
        this.logger.error(`处理超时设备 ${bindingId} 失败: ${error.message}`, error.stack);
      }
    }
  }

  async create(createEsp32Dto: CreateEsp32Dto): Promise<Esp32> {
    const bindingId = randomUUID();
    const esp32 = this.esp32Repository.create({
      ...createEsp32Dto,
      bindingId,
    });
    return await this.esp32Repository.save(esp32);
  }

  async findAll(): Promise<Esp32[]> {
    return await this.esp32Repository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: number): Promise<Esp32> {
    const esp32 = await this.esp32Repository.findOne({
      where: { id },
    });
    if (!esp32) {
      throw new NotFoundException(`ESP32芯片ID ${id} 不存在`);
    }
    return esp32;
  }

  async findByBindingId(bindingId: string): Promise<Esp32> {
    const esp32 = await this.esp32Repository.findOne({
      where: { bindingId },
    });
    if (!esp32) {
      throw new NotFoundException(`绑定ID ${bindingId} 不存在`);
    }
    return esp32;
  }

  async update(id: number, updateEsp32Dto: UpdateEsp32Dto): Promise<Esp32> {
    const esp32 = await this.findOne(id);
    const updatedEsp32 = Object.assign(esp32, updateEsp32Dto);
    return await this.esp32Repository.save(updatedEsp32);
  }

  async remove(id: number): Promise<void> {
    const esp32 = await this.findOne(id);
    await this.esp32Repository.remove(esp32);
  }

  async checkHealth(bindingId: string): Promise<{
    status: string;
    bindingId: string;
    timestamp: string;
  }> {
    const esp32 = await this.findByBindingId(bindingId);
    const now = Date.now();
    this.bindingIdLastRequestTime.set(bindingId, now);
    if (esp32.taskId) {
      try {
        const task = await this.notificationTaskRepository.findOne({
          where: { id: esp32.taskId },
        });
        if (task && task.status !== TaskStatus.PAUSED) {
          task.status = TaskStatus.PAUSED;
          await this.notificationTaskRepository.save(task);
          this.logger.log(`已将任务ID ${esp32.taskId}（绑定ID: ${bindingId}）状态更新为 PAUSED`);
        }
      } catch (error) {
        this.logger.error(`更新任务状态失败: ${error.message}`, error.stack);
      }
    }
    return {
      status: 'ok',
      bindingId: esp32.bindingId,
      timestamp: new Date().toISOString(),
    };
  }
}

