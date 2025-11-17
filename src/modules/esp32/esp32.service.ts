/*
 * @Author: yaoyc yaoyunchou@bananain.com
 * @Date: 2025-01-18 20:00:00
 * @LastEditors: yaoyc yaoyunchou@bananain.com
 * @LastEditTime: 2025-01-18 20:00:00
 * @FilePath: \nest-cursor\src\modules\esp32\esp32.service.ts
 * @Description: ESP32芯片服务
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Esp32 } from './entities/esp32.entity';
import { CreateEsp32Dto } from './dto/create-esp32.dto';
import { UpdateEsp32Dto } from './dto/update-esp32.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class Esp32Service {
  constructor(
    @InjectRepository(Esp32)
    private readonly esp32Repository: Repository<Esp32>,
  ) {}

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
    return {
      status: 'ok',
      bindingId: esp32.bindingId,
      timestamp: new Date().toISOString(),
    };
  }
}

