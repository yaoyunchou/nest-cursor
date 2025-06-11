import { CheckInType } from './check-in.dto';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 用户打卡记录DTO
 */
export class UserActionRecordDto {
  /** 用户ID */
  @ApiProperty({ description: '用户ID' })
  userId: string;
  /** 打卡类型 */
  @ApiProperty({ description: '打卡类型', enum: CheckInType })
  type: CheckInType;
  /** 打卡时间（ISO8601字符串） */
  @ApiProperty({ description: '打卡时间' })
  checkInTime: string;
  /** 打卡日期（YYYY-MM-DD） */
  @ApiProperty({ description: '打卡日期' })
  date: string;
} 