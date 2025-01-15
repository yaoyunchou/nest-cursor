/*
 * @Author: yaoyc yaoyunchou@bananain.com
 * @Date: 2025-01-14 16:27:14
 * @LastEditors: yaoyc yaoyunchou@bananain.com
 * @LastEditTime: 2025-01-14 16:30:33
 * @FilePath: \nest-cursor\src\user\user.controller.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Controller, Get, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('用户管理')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  @ApiOperation({ summary: '创建用户' })
  @Post()
  async createUser() {
    // ...
  }

  @ApiOperation({ summary: '获取所有用户' })
  @Get()
  async findAll() {
    // ...
  }
} 