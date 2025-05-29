/*
 * @Author: yaoyc yaoyunchou@bananain.com
 * @Date: 2025-01-18 10:00:44
 * @LastEditors: yaoyc yaoyunchou@bananain.com
 * @LastEditTime: 2025-01-18 10:00:44
 * @FilePath: \nest-cursor\src\modules\creation\dto\create-creation.dto.ts
 * @Description: 创建作品DTO
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsOptional, IsBoolean, Length, ArrayMaxSize, IsUrl } from 'class-validator';

export class CreateCreationDto {
  @ApiProperty({ description: '作品标题', example: '我的AI作品' })
  @IsString({ message: '标题必须是字符串' })
  @Length(1, 100, { message: '标题长度必须在1-100字符之间' })
  title: string;

  @ApiProperty({ description: '提示词内容', example: '画一只可爱的小猫' })
  @IsString({ message: '提示词必须是字符串' })
  @Length(1, 5000, { message: '提示词长度必须在1-5000字符之间' })
  prompt: string;

  @ApiProperty({ 
    description: '图片URL数组', 
    type: [String], 
    required: false,
    example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg']
  })
  @IsOptional()
  @IsArray({ message: '图片必须是数组格式' })
  @ArrayMaxSize(10, { message: '图片数量不能超过10张' })
  @IsUrl({}, { each: true, message: '每个图片必须是有效的URL' })
  images?: string[];

  @ApiProperty({ 
    description: '是否公开到广场', 
    required: false, 
    default: false,
    example: false
  })
  @IsOptional()
  @IsBoolean({ message: '公开状态必须是布尔值' })
  isPublic?: boolean;
} 