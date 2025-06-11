import { IsString, IsEnum, IsISO8601, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 打卡类型
 */
export enum CheckInType {
  Morning = 'morning',
  Evening = 'evening',
}

/**
 * 用户打卡请求DTO
 */
export class CheckInDto {
  /** 用户ID,不是非必填 */
  @ApiProperty({ description: '用户ID' })
  @IsOptional()
  userId: string;

  /** 打卡类型（morning/early, evening/late） */
  @ApiProperty({ description: '打卡类型', enum: CheckInType })
  @IsEnum(CheckInType, { message: '打卡类型不合法' })
  type: CheckInType;

  /** 打卡时间（ISO8601字符串） */
  @ApiProperty({ description: '打卡时间' })
  @IsString({ message: '打卡时间格式不正确' })
  checkInTime: string;
} 