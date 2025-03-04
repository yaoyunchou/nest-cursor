import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';

@Catch(UnauthorizedException)
export class JwtExceptionFilter implements ExceptionFilter {
  catch(exception: UnauthorizedException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();
    
    // 检查是否是JWT相关错误
    const isJwtError = exception.message.includes('jwt') || 
                       exception.message.includes('unauthorized') ||
                       exception.message.includes('token');
    
    response.status(HttpStatus.OK).json({
      code: 403,
      message: isJwtError ? '登录信息无效或已过期，请重新登录' : exception.message,
      data: null,
      path: request.url,
      timestamp: Date.now()
    });
  }
} 