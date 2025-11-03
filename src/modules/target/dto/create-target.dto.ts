import { IsString, IsEnum, IsNumber, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTargetDto {
  @ApiProperty({ description: '用户ID', required: false })
  @IsOptional()
  @IsNumber()
  userId: number;

  @ApiProperty({ description: '目标名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: '目标描述' })
  @IsString()
  description: string;

  @ApiProperty({ description: '目标计划完成时间（小时）' })
  @IsNumber()
  plannedHours: number;

  @ApiProperty({ description: '目标开始时间' })
  @IsDateString()
  startTime: Date;

  @ApiProperty({ description: '目标结束时间' })
  @IsDateString()
  endTime: Date;
} 