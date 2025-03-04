import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({ description: '权限编码' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: '权限名称' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: '资源类型' })
  @IsString()
  @IsNotEmpty()
  resourceType: string;

  @ApiProperty({ description: '操作类型' })
  @IsString()
  @IsNotEmpty()
  action: string;

  @ApiProperty({ description: '权限描述', required: false })
  @IsString()
  description?: string;
} 