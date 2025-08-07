import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean } from 'class-validator';

/**
 * 创建字典DTO
 */
export class CreateDictionaryDto {
  @ApiProperty({ description: '字典分类', example: 'system' })
  @IsString({ message: '字典分类必须是字符串' })
  @IsNotEmpty({ message: '字典分类不能为空' })
  category: string;

  @ApiProperty({ description: '字典名称', example: 'status' })
  @IsString({ message: '字典名称必须是字符串' })
  @IsNotEmpty({ message: '字典名称不能为空' })
  name: string;

  @ApiProperty({ description: '字典值', example: 'active' })
  @IsString({ message: '字典值必须是字符串' })
  @IsNotEmpty({ message: '字典值不能为空' })
  value: string;

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