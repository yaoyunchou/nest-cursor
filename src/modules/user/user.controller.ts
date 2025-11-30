/*
 * @Author: yaoyc yaoyunchou@bananain.com
 * @Date: 2025-01-16 15:30:44
 * @LastEditors: yaoyc yaoyunchou@bananain.com
 * @LastEditTime: 2025-01-16 15:30:44
 * @FilePath: \nest-cursor\src\modules\user\user.controller.ts
 * @Description: 用户控制器
 */
import { 
  Controller, 
  Get, 
  Post, 
  Put,
  Delete,
  Body, 
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Request,
  UseInterceptors,
  ClassSerializerInterceptor
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { PaginatedResponse } from '../../shared/interfaces/pagination.interface';
import { Roles, UserRole } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { Public } from '../auth/decorators/public.decorator';
import { UserSummaryService } from './user-summary.service';

/**
 * 用户管理
 * 创建用户不需要验证权限
 */
@ApiTags('用户管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('user')
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly userSummaryService: UserSummaryService,
  ) {}

  @ApiOperation({ summary: '创建用户' })
  @ApiResponse({ 
    type: UserResponseDto,
    description: '创建用户响应' 
  })
  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.userService.create(createUserDto);
  }

  @ApiOperation({ summary: '获取用户列表' })
  @ApiResponse({ 
    type: PaginatedResponse,
    description: '用户列表响应' 
  })
  @Roles(UserRole.ADMIN, UserRole.USER)
  @Get('list')
  async findAll(@Query() query: QueryUserDto): Promise<PaginatedResponse<UserResponseDto>> {
    return this.userService.findAll(query);
  }

  @ApiOperation({ summary: '获取用户详情' })
  @ApiResponse({ 
    type: UserResponseDto,
    description: '用户详情响应' 
  })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<UserResponseDto> {
    return this.userService.findOne(id);
  }

  @ApiOperation({ summary: '获取当前用户信息' })
  @ApiResponse({ 
    type: UserResponseDto,
    description: '当前用户信息响应' 
  })
  @Get('/info/detail')
  async findUserInfo(@Request() req): Promise<UserResponseDto> {
    // 获取当前登录用户信息
    // console.log(req.user);
    const userId = parseInt(req?.user?.userId, 10);
    if (isNaN(userId)) {
      throw new Error('无效的用户ID');
    }
    return this.userService.findOne(userId);
  }

  @ApiOperation({ summary: '更新用户' })
  @ApiResponse({ 
    type: UserResponseDto,
    description: '更新用户响应' 
  })
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.userService.update(id, updateUserDto);
  }

  // 修改密码
  @ApiOperation({ summary: '修改密码' })
  @ApiResponse({ 
    type: UserResponseDto,
    description: '修改密码响应' 
  })
  @Put('change/password')
  async updatePassword(
    @Request() req, 
    @Body() updatePasswordDto: UpdatePasswordDto
  ): Promise<UserResponseDto> {
    return this.userService.updatePassword(req.user.userId, updatePasswordDto);
  }

  @ApiOperation({ summary: '删除用户' })
  @ApiResponse({ 
    description: '删除用户响应' 
  })
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.userService.remove(id);
  }

  /**
   * 只有管理员可以重置密码, 需要从请求体中获取jwt的用户信息
   * query传入修改重置密码的用户id
   * 重置密码为"2025@xfy"
   * @param id 
   * @returns 
   */
  @ApiOperation({ summary: '重置密码' })
  @ApiResponse({ 
    description: '重置密码响应' 
  })
  @Put('reset/password')
  async resetPassword(@Request() req, @Query('id') id: number): Promise<void> {  
    return this.userService.resetPassword(req.user, id);
  }

  /**
   * 用户首页汇总接口
   * 返回用户首页所需的所有汇总数据，包括用户信息、各模块统计数据等
   * @param req 请求对象，包含当前用户信息（可选）
   * @returns 用户首页汇总数据
   */
  @Get('summary')
  @Public()
  @ApiOperation({ 
    summary: '用户首页汇总', 
    description: '返回用户首页所需的所有汇总数据。如果用户已登录则返回完整数据，如果未登录则返回 isAuth: false 和默认值' 
  })
  @ApiResponse({
    status: 200,
    description: '未登录用户响应',
    schema: {
      type: 'object',
      properties: {
        isAuth: {
          type: 'boolean',
          example: false,
          description: '认证状态，false表示未登录',
        },
        goals: {
          type: 'object',
          properties: {
            statistics: {
              type: 'object',
              properties: {
                total: { type: 'number', example: 0 },
                completed: { type: 'number', example: 0 },
                inProgress: { type: 'number', example: 0 },
                completion_rate: { type: 'number', example: 0 },
              },
            },
            list: { type: 'array', items: { type: 'object' } },
          },
        },
        tasks: {
          type: 'object',
          properties: {
            todayCount: { type: 'number', example: 0 },
          },
        },
        reading: {
          type: 'object',
          properties: {
            todayCheckIns: { type: 'number', example: 0 },
          },
        },
        errorbook: {
          type: 'object',
          properties: {
            total: { type: 'number', example: 0 },
            today: { type: 'number', example: 0 },
          },
        },
        focus: {
          type: 'object',
          properties: {
            today: { type: 'number', example: 0 },
            month: { type: 'number', example: 0 },
            total: { type: 'number', example: 0 },
          },
        },
        habits: {
          type: 'object',
          properties: {
            inProgress: { type: 'number', example: 0 },
          },
        },
        period: {
          type: 'object',
          properties: {
            status: { type: 'string', example: '' },
            nextDays: { type: 'number', example: 0 },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '已登录用户响应',
    schema: {
      type: 'object',
      properties: {
        isAuth: {
          type: 'boolean',
          example: true,
          description: '认证状态，true表示已登录',
        },
        user: {
          type: 'object',
          properties: {
            username: { type: 'string', example: '用户名' },
            avatar: { type: 'string', example: '头像URL' },
          },
        },
        goals: {
          type: 'object',
          properties: {
            statistics: {
              type: 'object',
              properties: {
                total: { type: 'number', example: 10 },
                completed: { type: 'number', example: 3 },
                inProgress: { type: 'number', example: 5 },
                completion_rate: { type: 'number', example: 30 },
              },
            },
            list: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  name: { type: 'string' },
                  status: { type: 'string' },
                  plannedHours: { type: 'number' },
                  progress: { type: 'number' },
                  completionPercentage: { type: 'number' },
                },
              },
            },
          },
        },
        tasks: {
          type: 'object',
          properties: {
            todayCount: { type: 'number', example: 5 },
          },
        },
        reading: {
          type: 'object',
          properties: {
            todayCheckIns: { type: 'number', example: 2 },
          },
        },
        errorbook: {
          type: 'object',
          properties: {
            total: { type: 'number', example: 0 },
            today: { type: 'number', example: 0 },
          },
        },
        focus: {
          type: 'object',
          properties: {
            today: { type: 'number', example: 0 },
            month: { type: 'number', example: 0 },
            total: { type: 'number', example: 0 },
          },
        },
        habits: {
          type: 'object',
          properties: {
            inProgress: { type: 'number', example: 0 },
          },
        },
        period: {
          type: 'object',
          properties: {
            status: { type: 'string', example: '' },
            nextDays: { type: 'number', example: 0 },
          },
        },
      },
    },
  })
  async summary(@Request() req) {
    const userId = req?.user?.userId ? parseInt(req.user.userId, 10) : undefined;
    return await this.userSummaryService.getUserSummary(userId);
  }
} 