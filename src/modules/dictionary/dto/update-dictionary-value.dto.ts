import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateDictionaryValueDto {
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
} 