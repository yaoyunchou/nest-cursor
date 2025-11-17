/*
 * @Author: yaoyc yaoyunchou@bananain.com
 * @Date: 2025-01-18 21:00:00
 * @LastEditors: yaoyc yaoyunchou@bananain.com
 * @LastEditTime: 2025-01-18 21:00:00
 * @FilePath: \nest-cursor\src\modules\system-log\system-log.service.ts
 * @Description: 系统日志服务
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemLog, LogLevel, LogModule } from './entities/system-log.entity';
import { CreateSystemLogDto } from './dto/create-system-log.dto';
import { QuerySystemLogDto } from './dto/query-system-log.dto';
import { PaginatedResponse } from '../../shared/interfaces/pagination.interface';

@Injectable()
export class SystemLogService {
  constructor(
    @InjectRepository(SystemLog)
    private readonly systemLogRepository: Repository<SystemLog>,
  ) {}

  async create(createSystemLogDto: CreateSystemLogDto): Promise<SystemLog> {
    const log = this.systemLogRepository.create(createSystemLogDto);
    return await this.systemLogRepository.save(log);
  }

  async findAll(query: QuerySystemLogDto): Promise<PaginatedResponse<SystemLog>> {
    const {
      pageIndex = 1,
      pageSize = 10,
      level,
      module,
      relatedId,
    } = query;
    const queryBuilder = this.systemLogRepository.createQueryBuilder('log');
    if (level) {
      queryBuilder.andWhere('log.level = :level', { level });
    }
    if (module) {
      queryBuilder.andWhere('log.module = :module', { module });
    }
    if (relatedId) {
      queryBuilder.andWhere('log.relatedId = :relatedId', { relatedId });
    }
    queryBuilder.orderBy('log.createdAt', 'DESC');
    const [list, total] = await queryBuilder
      .skip((pageIndex - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();
    return {
      list,
      total,
      pageSize,
      pageIndex,
    };
  }

  async logAlert(
    module: LogModule,
    content: string,
    relatedId?: string,
    extraData?: any,
  ): Promise<SystemLog> {
    return this.create({
      level: LogLevel.ALERT,
      module,
      content,
      relatedId,
      extraData: extraData ? JSON.stringify(extraData) : undefined,
    });
  }

  async logError(
    module: LogModule,
    content: string,
    relatedId?: string,
    extraData?: any,
  ): Promise<SystemLog> {
    return this.create({
      level: LogLevel.ERROR,
      module,
      content,
      relatedId,
      extraData: extraData ? JSON.stringify(extraData) : undefined,
    });
  }

  async logInfo(
    module: LogModule,
    content: string,
    relatedId?: string,
    extraData?: any,
  ): Promise<SystemLog> {
    return this.create({
      level: LogLevel.INFO,
      module,
      content,
      relatedId,
      extraData: extraData ? JSON.stringify(extraData) : undefined,
    });
  }

  async logWarn(
    module: LogModule,
    content: string,
    relatedId?: string,
    extraData?: any,
  ): Promise<SystemLog> {
    return this.create({
      level: LogLevel.WARN,
      module,
      content,
      relatedId,
      extraData: extraData ? JSON.stringify(extraData) : undefined,
    });
  }
}

