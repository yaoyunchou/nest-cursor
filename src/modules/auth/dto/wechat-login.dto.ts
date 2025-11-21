import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class WechatLoginDto {
  @ApiProperty({ description: '微信登录code' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: '小程序账号ID（UUID）', required: false })
  @IsString()
  @IsOptional()
  accountId?: string;

  @ApiProperty({ description: '用户名' })
  @IsString()
  @IsOptional()
  username?: string; 

  @ApiProperty({ description: '用户手机号' })
  @IsString()
  @IsOptional()
  phone?: string; 

  @ApiProperty({ description: '头像' })
  @IsString()
  @IsOptional()
  avatar?: string;
} 