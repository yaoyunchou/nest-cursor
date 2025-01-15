/*
 * @Author: yaoyc yaoyunchou@bananain.com
 * @Date: 2025-01-14 16:22:55
 * @LastEditors: yaoyc yaoyunchou@bananain.com
 * @LastEditTime: 2025-01-14 16:23:05
 * @FilePath: \nest-cursor\src\health\health.controller.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('系统')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: '健康检查接口' })
  @ApiResponse({
    status: 200,
    description: '服务正常运行',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          example: 'ok',
          description: '服务状态'
        },
        timestamp: {
          type: 'string',
          example: '2024-03-21T10:00:00Z',
          description: '当前时间戳'
        }
      }
    }
  })
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString()
    };
  }
} 