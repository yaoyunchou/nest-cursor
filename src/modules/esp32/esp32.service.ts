/*
 * @Author: yaoyc yaoyunchou@bananain.com
 * @Date: 2025-01-18 20:00:00
 * @LastEditors: yaoyc yaoyunchou@bananain.com
 * @LastEditTime: 2025-01-18 20:00:00
 * @FilePath: \nest-cursor\src\modules\esp32\esp32.service.ts
 * @Description: ESP32芯片服务
 */
import { Injectable, NotFoundException, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Esp32 } from './entities/esp32.entity';
import { CreateEsp32Dto } from './dto/create-esp32.dto';
import { UpdateEsp32Dto } from './dto/update-esp32.dto';
import { randomUUID } from 'crypto';
import { SystemLogService } from '../system-log/system-log.service';
import { LogModule } from '../system-log/entities/system-log.entity';

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
    private readonly systemLogService: SystemLogService,
  ) {}

  onModuleInit() {
    this.startHealthCheckTimer();
    this.logger.log('ESP32健康检查定时器已启动');
  }

  onModuleDestroy() {
    if (this.checkTimer) {
      clearInterval(this.checkTimer);
      this.checkTimer = null;
      this.logger.log('ESP32健康检查定时器已停止');
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
    // 更新该bindingId的最后请求时间（如果之前被移除，这里会重新开始记录）
    this.bindingIdLastRequestTime.set(bindingId, now);
    return {
      status: 'ok',
      bindingId: esp32.bindingId,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 启动健康检查定时器
   * 使用递归 setTimeout 确保上一次检查完成后再执行下一次，避免并发执行
   */
  private startHealthCheckTimer(): void {
    const scheduleNext = () => {
      this.checkTimer = setTimeout(async () => {
        try {
          await this.checkTimeoutBindingIds();
        } catch (error) {
          this.logger.error(`健康检查执行失败: ${error.message}`, error.stack);
        } finally {
          // 无论成功或失败，都安排下一次检查
          scheduleNext();
        }
      }, this.checkInterval);
    };
    // 启动第一次检查
    scheduleNext();
  }

  /**
   * 检查超时的bindingId并触发告警
   */
  private async checkTimeoutBindingIds(): Promise<void> {
    const now = Date.now();
    const timeoutBindingIds: string[] = [];
    // 检查所有bindingId是否超时
    for (const [bindingId, lastRequestTime] of this.bindingIdLastRequestTime.entries()) {
      const timeSinceLastRequest = now - lastRequestTime;
      // 如果超过1分钟没有请求，标记为超时
      if (timeSinceLastRequest >= this.timeoutDuration) {
        timeoutBindingIds.push(bindingId);
      }
    }
    // 为超时的bindingId触发告警并移除记录
    // 使用 Promise.all 并行处理多个告警，提高效率
    const alertPromises = timeoutBindingIds.map(async (bindingId) => {
      const lastRequestTime = this.bindingIdLastRequestTime.get(bindingId);
      if (lastRequestTime) {
        try {
          await this.triggerAlert(bindingId, lastRequestTime, now);
          // 告警后移除该bindingId的记录，等待下次请求重新开始计时
          this.bindingIdLastRequestTime.delete(bindingId);
        } catch (error) {
          this.logger.error(`触发告警失败 (bindingId: ${bindingId}): ${error.message}`, error.stack);
          // 即使告警失败，也移除记录，避免重复告警
          this.bindingIdLastRequestTime.delete(bindingId);
        }
      }
    });
    await Promise.all(alertPromises);
  }

  /**
   * 触发告警
   */
  private async triggerAlert(bindingId: string, lastRequestTime: number, currentTime: number): Promise<void> {
    const timeDiff = currentTime - lastRequestTime;
    const timeoutMinutes = Math.floor(timeDiff / 60000);
    const timeoutSeconds = Math.floor((timeDiff % 60000) / 1000);
    const alertContent = `bindingId ${bindingId} 距离上次请求已超过 ${timeoutMinutes} 分 ${timeoutSeconds} 秒`;
    try {
      await this.systemLogService.logAlert(
        LogModule.ESP32,
        alertContent,
        bindingId,
        {
          bindingId,
          lastRequestTime: new Date(lastRequestTime).toISOString(),
          currentTime: new Date(currentTime).toISOString(),
          timeDiffMs: timeDiff,
          timeoutMinutes,
          timeoutSeconds,
        },
      );
      this.logger.warn(alertContent);
    } catch (error) {
      this.logger.error(`触发告警失败: ${error.message}`, error.stack);
    }
  }
}

