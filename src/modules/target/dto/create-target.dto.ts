import { IsString, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTargetDto {
  @ApiProperty({ description: '目标名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: '目标描述' })
  @IsString()
  description: string;

  @ApiProperty({ description: '目标类型' })
  @IsString()
  type: string;

  @ApiProperty({ description: '目标计划完成时间（小时）' })
  @IsNumber()
  plannedHours: number;
} 