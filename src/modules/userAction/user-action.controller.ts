import { Controller, Post, Get, Body, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserActionService } from './user-action.service';
import { CheckInDto } from './dto/check-in.dto';
import { UserActionRecordDto } from './dto/user-action-record.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * 用户打卡控制器
 * 负责处理用户打卡相关的HTTP请求
 */
@ApiTags('用户打卡')
@UseGuards(JwtAuthGuard)
@Controller('user-action')
export class UserActionController {
  constructor(private readonly userActionService: UserActionService) {}

  /**
   * 用户打卡接口
   * @param checkInDto 打卡数据
   */
  @ApiOperation({ summary: '用户打卡' })
  @ApiResponse({ type: UserActionRecordDto, description: '打卡记录响应' })
  @Post('check-in')
  async executeCheckIn(@Body() checkInDto: CheckInDto, @Req() request: Request): Promise<UserActionRecordDto> {
    // 用户id 直接从jwt中获取， 
    const user = request.user as any;
    checkInDto.userId = user.id;

    return this.userActionService.executeCheckIn(checkInDto);
  }

  /**
   * 查询用户打卡记录接口
   * @param userId 用户ID
   * @param date 日期（可选，格式：YYYY-MM-DD）
   */
  @ApiOperation({ summary: '查询用户打卡记录' })
  @ApiResponse({ type: [UserActionRecordDto], description: '打卡记录列表' })
  @Get('records')
  async getRecords(@Query('userId') userId: string, @Query('date') date?: string): Promise<UserActionRecordDto[]> {
    return this.userActionService.getRecords({ userId, date });
  }
} 