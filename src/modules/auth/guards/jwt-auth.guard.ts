/*
 * @Author: yaoyc yaoyunchou@bananain.com
 * @Date: 2025-01-16 15:50:44
 * @LastEditors: yaoyc yaoyunchou@bananain.com
 * @LastEditTime: 2025-01-16 15:50:44
 * @FilePath: \nest-cursor\src\modules\auth\guards\jwt-auth.guard.ts
 * @Description: JWT认证守卫
 */
import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * JWT认证守卫
 * 
 * 该守卫继承自Passport的AuthGuard，用于验证请求中的JWT令牌
 * 支持通过@Public()装饰器标记的路由跳过认证
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  /**
   * 构造函数
   * @param reflector - 用于获取路由元数据的Reflector实例
   */
  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * 判断当前请求是否可以通过认证
   * 
   * @param context - 执行上下文，包含请求信息
   * @returns 如果路由被标记为公开，直接返回true；否则执行JWT认证
   */
  canActivate(context: ExecutionContext) {
    // 检查路由是否被@Public()装饰器标记为公开访问
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(), // 检查方法级别的元数据
      context.getClass(),   // 检查控制器级别的元数据
    ]);

    // 如果路由被标记为公开，跳过JWT认证
    if (isPublic) {
      return true;
    }

    // 否则执行父类的JWT认证逻辑
    const result = super.canActivate(context);
    return result;
  }
} 