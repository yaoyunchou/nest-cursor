import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

/**
 * 创建任务DTO
 * swagger 文档
 * 任务名称
 * 任务描述
 * 任务时间
 */
export class CreateTargetTaskDto {
  // 非必填
  @ApiProperty({ description: '任务名称' })
  @IsOptional()
  @IsString()
  name: string;

  // 必填
  @ApiProperty({ description: '任务描述' })
  @IsNotEmpty()
  @IsString()
  description: string;

  // 必填
  @ApiProperty({ description: '任务时间' })
  @IsNotEmpty()
  @IsNumber()
  time: number;

  // 非必填
  @ApiProperty({ description: '目标ID' })
  @IsOptional()
  @IsNumber()
  targetId: number;

  // 非必填
  @ApiProperty({ description: '任务图片' })
  @IsOptional()
  @IsString()
  images: string;

  // 非必填
  @ApiProperty({ description: '用户ID' })
  @IsOptional()
  @IsNumber()
  userId: number;
}