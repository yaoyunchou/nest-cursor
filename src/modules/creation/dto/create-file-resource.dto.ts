import { IsString, IsOptional, IsArray, IsInt, IsUrl, IsIn, IsNumber, Min, Max, Length } from 'class-validator';

/**
 * 创建图片资源DTO
 */
export class CreateFileResourceDto {
  /** 图片资源URL */
  @IsString({ message: '图片URL必须为字符串' })
  url: string;

  /** 图片来源（如creation/manual） */
  @IsString({ message: '图片来源必须为字符串' })
  origin: string;

  /** 图片类型/分类 */
  @IsOptional()
  @IsString({ message: '图片类型必须为字符串' })
  type?: string;

  /** 标签 */
  @IsOptional()
  @IsArray({ message: '标签必须为字符串数组' })
  @IsString({ each: true, message: '每个标签必须为字符串' })
  tags?: string[];

  /** 适用场景 */
  @IsOptional()
  @IsArray({ message: '适用场景必须为字符串数组' })
  @IsString({ each: true, message: '每个场景必须为字符串' })
  scene?: string[];

  /** 权重，0-100 */
  @IsOptional()
  @IsInt({ message: '权重必须为整数' })
  @Min(0, { message: '权重不能小于0' })
  @Max(100, { message: '权重不能大于100' })
  weight?: number;

  /** 图片描述 */
  @IsOptional()
  @IsString({ message: '描述必须为字符串' })
  description?: string;

  /** 来源ID（可用于溯源） */
  @IsOptional()
  @IsString({ message: '来源ID必须为字符串' })
  originId?: string;
} 