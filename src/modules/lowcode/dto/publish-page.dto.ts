import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class PublishPageDto {
  @ApiProperty({ description: '发布说明', required: false })
  @IsString()
  @IsOptional()
  remark?: string;

  @ApiProperty({ description: '版本号', required: false })
  @IsString()
  @IsOptional()
  version?: string;
} 