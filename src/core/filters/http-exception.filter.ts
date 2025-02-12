import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();
    const status =  200;
    const exceptionResponse = exception.getResponse();

    response.status(status).json({
      code: exceptionResponse['code']  || 1000,
      message: exceptionResponse['message'] || exception.message,
      data: null,
      path: request.url,
      timestamp: Date.now()
    });
  }
} 