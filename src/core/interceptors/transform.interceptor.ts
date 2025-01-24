import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../../shared/interfaces/response.interface';

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    console.log('data', request.body);
    return next.handle().pipe(
      map((data) => {
        // console.log('data', data);
        return {
          code: 0,
          message: '操作成功',
          data,
          path: request.url,
          timestamp: Date.now(),
        };
      }),
    );
  }
}
