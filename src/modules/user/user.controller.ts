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
  UseGuards
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { User } from './entities/user.entity';
import { PaginatedResponse } from '../../shared/interfaces/pagination.interface';
import { Roles, UserRole } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('用户管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: '创建用户' })
  @ApiResponse({ 
    type: User,
    description: '创建用户响应' 
  })
  @Roles(UserRole.ADMIN)
  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.create(createUserDto);
  }

  @ApiOperation({ summary: '获取用户列表' })
  @ApiResponse({ 
    type: PaginatedResponse,
    description: '用户列表响应' 
  })
  @Roles(UserRole.ADMIN, UserRole.USER)
  @Get('list')
  async findAll(@Query() query: QueryUserDto): Promise<PaginatedResponse<User>> {
    return this.userService.findAll(query);
  }

  @ApiOperation({ summary: '获取用户详情' })
  @ApiResponse({ 
    type: User,
    description: '用户详情响应' 
  })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.userService.findOne(id);
  }

  @ApiOperation({ summary: '更新用户' })
  @ApiResponse({ 
    type: User,
    description: '更新用户响应' 
  })
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.userService.update(id, updateUserDto);
  }

  @ApiOperation({ summary: '删除用户' })
  @ApiResponse({ 
    description: '删除用户响应' 
  })
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.userService.remove(id);
  }
} 