import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReadingCheckinService } from './reading-checkin.service';
import { CreateReadingCheckinDto } from './dto/create-reading-checkin.dto';
import { UpdateReadingCheckinDto } from './dto/update-reading-checkin.dto';
import { QueryReadingCheckinDto } from './dto/query-reading-checkin.dto';
import { ReadingCheckin } from './entities/reading-checkin.entity';
import { RoleCode } from '../role/entities/role.entity';

/**
 * 打卡记录控制器
 * 处理与打卡记录相关的HTTP请求
 */
@ApiTags('打卡记录')
@Controller('reading/checkins')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReadingCheckinController {
  constructor(private readonly readingCheckinService: ReadingCheckinService) {}

  /**
   * 创建打卡记录
   * @param createReadingCheckinDto 创建打卡记录DTO
   * @param req 请求对象，包含当前用户信息
   * @returns 创建的打卡记录
   */
  @Post()
  @ApiOperation({ summary: '创建打卡记录' })
  async create(@Body() createReadingCheckinDto: CreateReadingCheckinDto, @Request() req): Promise<ReadingCheckin> {
    const userId = req?.user?.userId ? parseInt(req.user.userId, 10) : undefined;
    if (userId === undefined) {
      throw new Error('用户ID不存在');
    }
    return this.readingCheckinService.create(createReadingCheckinDto, userId);
  }

  /**
   * 获取打卡记录列表
   * @param query 查询参数
   * @param req 请求对象，包含当前用户信息
   * @returns 打卡记录列表
   */
  @Get()
  @ApiOperation({ summary: '获取打卡记录列表' })
  async findAll(@Query() query: QueryReadingCheckinDto, @Request() req): Promise<ReadingCheckin[]> {
    const userId = req?.user?.userId ? parseInt(req.user.userId, 10) : undefined;
    if (userId === undefined) {
      throw new Error('用户ID不存在');
    }
    const roles = req?.user?.roles || [];
    const isAdmin = roles.some((role: any) => {
      if (typeof role === 'string') {
        return role.toLowerCase() === RoleCode.ADMIN;
      }
      if (typeof role === 'object' && role.code) {
        return role.code.toLowerCase() === RoleCode.ADMIN;
      }
      return false;
    });
    return this.readingCheckinService.findAll(query, userId, isAdmin);
  }

  /**
   * 获取打卡记录详情
   * @param id 打卡记录ID
   * @param req 请求对象，包含当前用户信息
   * @returns 打卡记录详情
   */
  @Get(':id')
  @ApiOperation({ summary: '获取打卡记录详情' })
  async findOne(@Param('id', ParseIntPipe) id: number, @Request() req): Promise<ReadingCheckin> {
    const userId = req?.user?.userId ? parseInt(req.user.userId, 10) : undefined;
    if (userId === undefined) {
      throw new Error('用户ID不存在');
    }
    const roles = req?.user?.roles || [];
    const isAdmin = roles.some((role: any) => {
      if (typeof role === 'string') {
        return role.toLowerCase() === RoleCode.ADMIN;
      }
      if (typeof role === 'object' && role.code) {
        return role.code.toLowerCase() === RoleCode.ADMIN;
      }
      return false;
    });
    return this.readingCheckinService.findOne(id, userId, isAdmin);
  }

  /**
   * 更新打卡记录
   * @param id 打卡记录ID
   * @param updateReadingCheckinDto 更新打卡记录DTO
   * @param req 请求对象，包含当前用户信息
   * @returns 更新后的打卡记录
   */
  @Put(':id')
  @ApiOperation({ summary: '更新打卡记录' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReadingCheckinDto: UpdateReadingCheckinDto,
    @Request() req,
  ): Promise<ReadingCheckin> {
    const userId = req?.user?.userId ? parseInt(req.user.userId, 10) : undefined;
    if (userId === undefined) {
      throw new Error('用户ID不存在');
    }
    return this.readingCheckinService.update(id, updateReadingCheckinDto, userId);
  }

  /**
   * 删除打卡记录
   * @param id 打卡记录ID
   * @param req 请求对象，包含当前用户信息
   */
  @Delete(':id')
  @ApiOperation({ summary: '删除打卡记录' })
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req): Promise<void> {
    const userId = req?.user?.userId ? parseInt(req.user.userId, 10) : undefined;
    if (userId === undefined) {
      throw new Error('用户ID不存在');
    }
    return this.readingCheckinService.remove(id, userId);
  }
}

