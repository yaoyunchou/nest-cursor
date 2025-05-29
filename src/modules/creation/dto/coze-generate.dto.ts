/*
 * @Author: yaoyc yaoyunchou@bananain.com
 * @Date: 2025-01-18 10:00:44
 * @LastEditors: yaoyc yaoyunchou@bananain.com
 * @LastEditTime: 2025-01-18 10:00:44
 * @FilePath: \nest-cursor\src\modules\creation\dto\coze-generate.dto.ts
 * @Description: Coze图片生成DTO
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject, IsBoolean, Length } from 'class-validator';

export class CozeGenerateImageDto {
  @ApiProperty({ description: '图片生成提示词', example: '画一只可爱的小猫，卡通风格' })
  @IsString({ message: '提示词必须是字符串' })
  @Length(1, 2000, { message: '提示词长度必须在1-2000字符之间' })
  prompt: string;

  @ApiProperty({ description: '参考图片', required: false, example: 'https://example.com/image.jpg' })
  @IsOptional()
  @IsString({ message: '参考图片必须是字符串' })
  @Length(1, 2000, { message: '参考图片长度必须在1-2000字符之间' })
  image?: Express.Multer.File;

  @ApiProperty({ 
    description: '工作流ID（可选，不填则使用默认工作流）', 
    required: false,
    example: 'workflow_123456'
  })
  @IsOptional()
  @IsString({ message: '工作流ID必须是字符串' })
  workflowId?: string;

  @ApiProperty({ 
    description: '是否异步执行', 
    required: false, 
    default: false,
    example: false
  })
  @IsOptional()
  @IsBoolean({ message: '异步执行标志必须是布尔值' })
  isAsync?: boolean;

  @ApiProperty({ 
    description: '额外参数', 
    required: false,
    example: { style: 'cartoon', size: '512x512' }
  })
  @IsOptional()
  @IsObject({ message: '额外参数必须是对象' })
  additionalParams?: Record<string, any>;
}

export class CozeWorkflowRunDto {
  @ApiProperty({ description: '工作流ID', example: 'workflow_123456' })
  @IsString({ message: '工作流ID必须是字符串' })
  workflowId: string;

  @ApiProperty({ 
    description: '工作流参数', 
    example: { prompt: '画一只小猫', style: 'cartoon' }
  })
  @IsObject({ message: '工作流参数必须是对象' })
  parameters: Record<string, any>;

  @ApiProperty({ 
    description: '是否异步执行', 
    required: false, 
    default: false,
    example: false
  })
  @IsOptional()
  @IsBoolean({ message: '异步执行标志必须是布尔值' })
  isAsync?: boolean;
} 