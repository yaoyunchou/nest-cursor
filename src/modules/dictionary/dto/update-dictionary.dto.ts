import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

/**
 * 更新字典DTO
 */
export class UpdateDictionaryDto {
  @ApiProperty({ description: '字典分类', example: 'system', required: false })
  @IsOptional()
  @IsString({ message: '字典分类必须是字符串' })
  category?: string;

  @ApiProperty({ description: '字典名称', example: 'status', required: false })
  @IsOptional()
  @IsString({ message: '字典名称必须是字符串' })
  name?: string;

  @ApiProperty({ description: '字典值', example: 'active', required: false })
  @IsOptional()
  @IsString({ message: '字典值必须是字符串' })
  value?: string;

  @ApiProperty({ description: '排序权重', example: 0, required: false })
  @IsOptional()
  @IsNumber({}, { message: '排序权重必须是数字' })
  sort?: number;

  @ApiProperty({ description: '是否启用', example: true, required: false })
  @IsOptional()
  @IsBoolean({ message: '是否启用必须是布尔值' })
  isEnabled?: boolean;

  @ApiProperty({ description: '备注', example: '系统状态字典', required: false })
  @IsOptional()
  @IsString({ message: '备注必须是字符串' })
  remark?: string;
} 