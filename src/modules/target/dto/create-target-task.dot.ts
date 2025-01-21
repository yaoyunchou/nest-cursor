import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

/**
 * 创建任务DTO
 * swagger 文档
 * 任务名称
 * 任务描述
 * 任务时间
 */
export class CreateTargetTaskDto {
  @ApiProperty({ description: '任务名称' })
  @IsNotEmpty()
  @IsString()
  name: string;


  @ApiProperty({ description: '任务描述' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ description: '任务时间' })
  @IsNotEmpty()
  @IsNumber()
  time: number;

  @ApiProperty({ description: '目标ID' })
  @IsNotEmpty()
  @IsNumber()
  targetId: number;
}