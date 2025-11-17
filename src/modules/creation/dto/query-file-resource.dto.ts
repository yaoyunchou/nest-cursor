import { IsOptional, IsString, IsArray, IsInt, Min, Max } from 'class-validator';

/**
 * 查询图片资源DTO
 */
export class QueryFileResourceDto {
  /** 当前页码 */
  @IsOptional()
  @IsInt({ message: '页码必须为整数' })
  @Min(1, { message: '页码最小为1' })
  page?: number = 1;

  /** 每页条数 */
  @IsOptional()
  @IsInt({ message: '每页条数必须为整数' })
  @Min(1, { message: '每页最小为1' })
  pageSize?: number = 20;

  /** 来源 */
  @IsOptional()
  @IsString({ message: '来源必须为字符串' })
  origin?: string;

  /** 标签 */
  @IsOptional()
  @IsArray({ message: '标签必须为字符串数组' })
  @IsString({ each: true, message: '每个标签必须为字符串' })
  tags?: string[];

  /** 场景 */
  @IsOptional()
  @IsArray({ message: '场景必须为字符串数组' })
  @IsString({ each: true, message: '每个场景必须为字符串' })
  scene?: string[];

  /** 类型 */
  @IsOptional()
  @IsString({ message: '类型必须为字符串' })
  type?: string;

  /** 权重下限 */
  @IsOptional()
  @IsInt({ message: '权重下限必须为整数' })
  @Min(0)
  weightMin?: number;

  /** 权重上限 */
  @IsOptional()
  @IsInt({ message: '权重上限必须为整数' })
  @Max(100)
  weightMax?: number;
} 