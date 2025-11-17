/*
 * @Author: yaoyc yaoyunchou@bananain.com
 * @Date: 2025-01-18 21:00:00
 * @LastEditors: yaoyc yaoyunchou@bananain.com
 * @LastEditTime: 2025-01-18 21:00:00
 * @FilePath: \nest-cursor\src\modules\system-log\system-log.controller.ts
 * @Description: 系统日志控制器
 */
import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, UserRole } from '../auth/decorators/roles.decorator';
import { SystemLogService } from './system-log.service';
import { CreateSystemLogDto } from './dto/create-system-log.dto';
import { QuerySystemLogDto } from './dto/query-system-log.dto';
import { SystemLog } from './entities/system-log.entity';
import { PaginatedResponse } from '../../shared/interfaces/pagination.interface';

@ApiTags('系统日志管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('system-log')
export class SystemLogController {
  constructor(private readonly systemLogService: SystemLogService) {}

  @ApiOperation({ summary: '创建系统日志' })
  @ApiResponse({
    type: SystemLog,
    description: '创建系统日志响应',
  })
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @Post()
  async create(@Body() createSystemLogDto: CreateSystemLogDto): Promise<SystemLog> {
    return this.systemLogService.create(createSystemLogDto);
  }

  @ApiOperation({ summary: '获取系统日志列表' })
  @ApiResponse({
    description: '系统日志列表响应',
  })
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @Get()
  async findAll(@Query() query: QuerySystemLogDto): Promise<PaginatedResponse<SystemLog>> {
    return this.systemLogService.findAll(query);
  }
}

