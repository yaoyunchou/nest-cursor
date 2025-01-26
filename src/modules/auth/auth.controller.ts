/*
 * @Author: yaoyc yaoyunchou@bananain.com
 * @Date: 2025-01-14 15:06:56
 * @LastEditors: yaoyc yaoyunchou@bananain.com
 * @LastEditTime: 2025-01-14 16:30:34
 * @FilePath: \nest-cursor\src\auth\auth.controller.ts
 * @Description: 认证控制器
 */
import { Controller, Post, Body, Get, Query, HttpException, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { WechatLoginDto } from './dto/wechat-login.dto';

@ApiTags('认证管理')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @ApiOperation({ summary: '用户登录' })
  @ApiResponse({ status: 200, description: '登录成功' })
  @ApiResponse({ status: 401, description: '用户名或密码错误' })
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @ApiOperation({ summary: '用户注册' })
  @ApiResponse({ status: 201, description: '注册成功' })
  @ApiResponse({ status: 409, description: '用户名已存在' })
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  /**
   * 微信小程序登录
   * 1， 获取openid 和 session_key, 可以存入jwt中吗？
   * 2，将信息存入session中
   * @param wechatLoginDto 
   * @returns 
   */
  @Public()
  @ApiOperation({ summary: '微信小程序登录' })
  @ApiResponse({ status: 200, description: '登录成功' })
  @ApiResponse({ status: 401, description: '登录失败' })
  @Post('wechat/login')
  async wechatLogin(@Body() wechatLoginDto: WechatLoginDto) {
    return this.authService.wechatLogin(wechatLoginDto);
  }

  // 获取微信小程序用户手机号码
  @Public()
  @ApiOperation({ summary: '获取微信小程序用户手机号码' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 401, description: '获取失败' })
  @Get('wechat/get-phone-number')
  async getPhoneNumber(@Query('code') code: string, @Request() req,) {
    // 获取openid
    const userId = req.userId;
    return this.authService.getUserPhoneNumber(code, userId);
  }
} 
