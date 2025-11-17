import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreatePageDto {
  @ApiProperty({ description: '页面标题' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: '页面JSON数据' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ description: '是否启用', default: true })
  @IsBoolean()
  @IsOptional()
  isEnabled?: boolean;
} 