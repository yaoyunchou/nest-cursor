import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

/**
 * 更新任务DTO
 * swagger 文档
 * 任务名称
 * 任务描述
 * 任务时间
 */
export class UpdateTargetTaskDto {  
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
}