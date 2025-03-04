import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class CreateMenuDto {
  @ApiProperty({ description: '菜单名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: '菜单图标', required: false })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiProperty({ description: '路由路径', required: false })
  @IsString()
  @IsOptional()
  path?: string;

  @ApiProperty({ description: '组件路径', required: false })
  @IsString()
  @IsOptional()
  component?: string;

  @ApiProperty({ description: '父菜单ID', required: false })
  @IsNumber()
  @IsOptional()
  parentId?: number;

  @ApiProperty({ description: '排序', required: false, default: 1 })
  @IsNumber()
  @IsOptional()
  sort?: number;

  @ApiProperty({ description: '是否显示', required: false, default: true })
  @IsBoolean()
  @IsOptional()
  isVisible?: boolean;
} 