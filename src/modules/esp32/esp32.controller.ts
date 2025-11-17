/*
 * @Author: yaoyc yaoyunchou@bananain.com
 * @Date: 2025-01-18 20:00:00
 * @LastEditors: yaoyc yaoyunchou@bananain.com
 * @LastEditTime: 2025-01-18 20:00:00
 * @FilePath: \nest-cursor\src\modules\esp32\esp32.controller.ts
 * @Description: ESP32芯片控制器
 */
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, UserRole } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { Esp32Service } from './esp32.service';
import { CreateEsp32Dto } from './dto/create-esp32.dto';
import { UpdateEsp32Dto } from './dto/update-esp32.dto';
import { Esp32 } from './entities/esp32.entity';

@ApiTags('ESP32芯片管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('esp32')
export class Esp32Controller {
  constructor(private readonly esp32Service: Esp32Service) {}

  @ApiOperation({ summary: '创建ESP32芯片' })
  @ApiResponse({
    type: Esp32,
    description: '创建ESP32芯片响应',
  })
  @Roles(UserRole.ADMIN)
  @Post()
  async create(@Body() createEsp32Dto: CreateEsp32Dto): Promise<Esp32> {
    return this.esp32Service.create(createEsp32Dto);
  }

  @ApiOperation({ summary: '获取所有ESP32芯片列表' })
  @ApiResponse({
    type: [Esp32],
    description: 'ESP32芯片列表响应',
  })
  @Roles(UserRole.ADMIN, UserRole.EDITOR, UserRole.USER)
  @Get()
  async findAll(): Promise<Esp32[]> {
    return this.esp32Service.findAll();
  }

  @ApiOperation({ summary: 'ESP32芯片健康检查' })
  @ApiResponse({
    status: 200,
    description: 'ESP32芯片健康检查响应',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          example: 'ok',
          description: '芯片状态',
        },
        bindingId: {
          type: 'string',
          example: '123e4567-e89b-12d3-a456-426614174000',
          description: '绑定ID',
        },
        timestamp: {
          type: 'string',
          example: '2024-03-21T10:00:00Z',
          description: '当前时间戳',
        },
      },
    },
  })
  @Public()
  @Get('health/:bindingId')
  async checkHealth(@Param('bindingId') bindingId: string): Promise<{
    status: string;
    bindingId: string;
    timestamp: string;
  }> {
    return this.esp32Service.checkHealth(bindingId);
  }

  @ApiOperation({ summary: '根据绑定ID获取ESP32芯片详情' })
  @ApiResponse({
    type: Esp32,
    description: 'ESP32芯片详情响应',
  })
  @Roles(UserRole.ADMIN, UserRole.EDITOR, UserRole.USER)
  @Get('binding/:bindingId')
  async findByBindingId(@Param('bindingId') bindingId: string): Promise<Esp32> {
    return this.esp32Service.findByBindingId(bindingId);
  }

  @ApiOperation({ summary: '根据ID获取ESP32芯片详情' })
  @ApiResponse({
    type: Esp32,
    description: 'ESP32芯片详情响应',
  })
  @Roles(UserRole.ADMIN, UserRole.EDITOR, UserRole.USER)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Esp32> {
    return this.esp32Service.findOne(id);
  }

  @ApiOperation({ summary: '更新ESP32芯片' })
  @ApiResponse({
    type: Esp32,
    description: '更新ESP32芯片响应',
  })
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEsp32Dto: UpdateEsp32Dto,
  ): Promise<Esp32> {
    return this.esp32Service.update(id, updateEsp32Dto);
  }

  @ApiOperation({ summary: '删除ESP32芯片' })
  @ApiResponse({
    description: '删除ESP32芯片响应',
  })
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.esp32Service.remove(id);
  }
}

