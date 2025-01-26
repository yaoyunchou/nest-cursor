import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class WechatLoginDto {
  @ApiProperty({ description: '微信登录code' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: '用户名' })
  @IsString()
  @IsOptional()
  username: string; 

  @ApiProperty({ description: '头像' })
  @IsString()
  @IsOptional()
  avatar: string;
} 