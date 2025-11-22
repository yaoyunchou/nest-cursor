/*
 * @Author: yaoyc yaoyunchou@bananain.com
 * @Date: 2025-01-18 20:00:00
 * @LastEditors: yaoyc yaoyunchou@bananain.com
 * @LastEditTime: 2025-01-18 20:00:00
 * @FilePath: \nest-cursor\src\modules\esp32\esp32.service.ts
 * @Description: ESP32芯片服务
 */
import { Injectable, NotFoundException, Logger, OnModuleDestroy } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Esp32 } from './entities/esp32.entity';
import { CreateEsp32Dto } from './dto/create-esp32.dto';
import { UpdateEsp32Dto } from './dto/update-esp32.dto';
import { randomUUID } from 'crypto';
import { SystemLogService } from '../system-log/system-log.service';
import { LogModule } from '../system-log/entities/system-log.entity';

@Injectable()
export class Esp32Service implements  OnModuleDestroy {
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
    // 创建一个bind 

    return {
      status: 'ok',
      bindingId: esp32.bindingId,
      timestamp: new Date().toISOString(),
    };
  }
}

