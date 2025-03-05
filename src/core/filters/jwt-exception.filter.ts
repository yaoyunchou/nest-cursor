import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';

@Catch(UnauthorizedException)
export class JwtExceptionFilter implements ExceptionFilter {
  catch(exception: UnauthorizedException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();
    // console.log('----------status------exceptionResponse-----', status, exceptionResponse);
    // 检查是否是JWT相关错误
    const isJwtError = exception.message.includes('jwt') || 
                       exception.message.includes('unauthorized') ||
                       exception.message.includes('token');
    
                       
    if(isJwtError){
      response.status(HttpStatus.OK).json({
        code: HttpStatus.FORBIDDEN,
        message: '登录信息无效或已过期，请重新登录',
        data: null,
        path: request.url,
        timestamp: Date.now()
      });
    }else{
        // 是否传入code, 如果传入code, 则返回code, 否则返回403
      response.status(HttpStatus.OK).json({
        code: 0,
        message: exception.message,
        data: null,
        path: request.url,
        timestamp: Date.now()
      });
    }
  }
} 