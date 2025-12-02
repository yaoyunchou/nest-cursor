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
import { ReadingTaskService } from './reading-task.service';
import { CreateReadingTaskDto } from './dto/create-reading-task.dto';
import { UpdateReadingTaskDto } from './dto/update-reading-task.dto';
import { QueryReadingTaskDto } from './dto/query-reading-task.dto';
import { ReadingTask } from './entities/reading-task.entity';
import { ListResponse } from '@/models/list-response.model';
import { RoleCode } from '../role/entities/role.entity';

/**
 * 读书任务控制器
 * 处理与读书任务相关的HTTP请求
 */
@ApiTags('读书任务')
@Controller('reading/tasks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReadingTaskController {
  constructor(private readonly readingTaskService: ReadingTaskService) {}

  /**
   * 创建读书任务
   * @param createReadingTaskDto 创建任务DTO
   * @param req 请求对象，包含当前用户信息
   * @returns 创建的任务
   */
  @Post()
  @ApiOperation({ summary: '创建读书任务' })
  async create(@Body() createReadingTaskDto: CreateReadingTaskDto, @Request() req): Promise<ReadingTask> {
    const userId = req?.user?.userId ? parseInt(req.user.userId, 10) : undefined;
    if (userId === undefined) {
      throw new Error('用户ID不存在');
    }
    return this.readingTaskService.create(createReadingTaskDto, userId);
  }

  /**
   * 获取任务列表
   * @param query 查询参数
   * @param req 请求对象，包含当前用户信息
   * @returns 任务列表
   */
  @Get()
  @ApiOperation({ summary: '获取读书任务列表' })
  async findAll(@Query() query: QueryReadingTaskDto, @Request() req): Promise<ListResponse<ReadingTask>> {
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
    return this.readingTaskService.findAll(query, userId, isAdmin);
  }

  /**
   * 获取任务详情
   * @param id 任务ID
   * @param req 请求对象，包含当前用户信息
   * @returns 任务详情
   */
  @Get(':id')
  @ApiOperation({ summary: '获取读书任务详情' })
  async findOne(@Param('id', ParseIntPipe) id: number, @Request() req): Promise<ReadingTask> {
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
    return this.readingTaskService.findOne(id, userId, isAdmin);
  }

  /**
   * 更新任务
   * @param id 任务ID
   * @param updateReadingTaskDto 更新任务DTO
   * @param req 请求对象，包含当前用户信息
   * @returns 更新后的任务
   */
  @Put(':id')
  @ApiOperation({ summary: '更新读书任务' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReadingTaskDto: UpdateReadingTaskDto,
    @Request() req,
  ): Promise<ReadingTask> {
    const userId = req?.user?.userId ? parseInt(req.user.userId, 10) : undefined;
    if (userId === undefined) {
      throw new Error('用户ID不存在');
    }
    return this.readingTaskService.update(id, updateReadingTaskDto, userId);
  }

  /**
   * 删除任务
   * @param id 任务ID
   * @param req 请求对象，包含当前用户信息
   */
  @Delete(':id')
  @ApiOperation({ summary: '删除读书任务' })
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req): Promise<void> {
    const userId = req?.user?.userId ? parseInt(req.user.userId, 10) : undefined;
    if (userId === undefined) {
      throw new Error('用户ID不存在');
    }
    return this.readingTaskService.remove(id, userId);
  }
}

