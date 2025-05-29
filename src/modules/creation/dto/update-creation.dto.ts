/*
 * @Author: yaoyc yaoyunchou@bananain.com
 * @Date: 2025-01-18 10:00:44
 * @LastEditors: yaoyc yaoyunchou@bananain.com
 * @LastEditTime: 2025-01-18 10:00:44
 * @FilePath: \nest-cursor\src\modules\creation\dto\update-creation.dto.ts
 * @Description: 更新作品DTO
 */
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateCreationDto } from './create-creation.dto';

export class UpdateCreationDto extends PartialType(CreateCreationDto) {
  @ApiProperty({ description: '作品标题', required: false, example: '我的AI作品' })
  title?: string;

  @ApiProperty({ description: '提示词内容', required: false, example: '画一只可爱的小猫' })
  prompt?: string;

  @ApiProperty({ 
    description: '图片URL数组', 
    type: [String], 
    required: false,
    example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg']
  })
  images?: string[];

  @ApiProperty({ 
    description: '是否公开到广场', 
    required: false, 
    example: false
  })
  isPublic?: boolean;
} 