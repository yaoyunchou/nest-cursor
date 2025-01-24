import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class WechatLoginDto {
  @ApiProperty({ description: '微信登录code' })
  @IsString()
  @IsNotEmpty()
  code: string;
} 