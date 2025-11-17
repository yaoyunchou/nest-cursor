/*
 * @Author: yaoyc yaoyunchou@bananain.com
 * @Date: 2025-01-18 20:00:00
 * @LastEditors: yaoyc yaoyunchou@bananain.com
 * @LastEditTime: 2025-01-18 20:00:00
 * @FilePath: \nest-cursor\src\modules\esp32\dto\create-esp32.dto.ts
 * @Description: 创建ESP32芯片DTO
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateEsp32Dto {
  @ApiProperty({ description: '芯片型号', required: false })
  @IsString()
  @IsOptional()
  chipModel?: string;

  @ApiProperty({ description: '备注', required: false })
  @IsString()
  @IsOptional()
  remark?: string;

  @ApiProperty({ description: '功能', required: false })
  @IsString()
  @IsOptional()
  function?: string;

  @ApiProperty({ description: '订单来源', required: false })
  @IsString()
  @IsOptional()
  orderSource?: string;

  @ApiProperty({ description: '订单ID', required: false })
  @IsString()
  @IsOptional()
  orderId?: string;
}

