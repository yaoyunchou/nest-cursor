/*
 * @Author: yaoyc yaoyunchou@bananain.com
 * @Date: 2025-01-16 15:50:44
 * @LastEditors: yaoyc yaoyunchou@bananain.com
 * @LastEditTime: 2025-01-16 15:50:44
 * @FilePath: \nest-cursor\src\modules\auth\guards\jwt-auth.guard.ts
 * @Description: JWT认证守卫
 */
import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
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
   * @returns 对于公开路由，仍然执行认证策略以解析用户信息，但认证失败不抛出异常；对于非公开路由，执行JWT认证
   */
  canActivate(context: ExecutionContext) {
    // 检查路由是否被@Public()装饰器标记为公开访问
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(), // 检查方法级别的元数据
      context.getClass(),   // 检查控制器级别的元数据
    ]);

    // 对于公开路由，仍然执行认证策略以解析用户信息（如果提供了token）
    // 但通过 handleRequest 方法处理认证失败的情况，不抛出异常
    // 对于非公开路由，执行JWT认证，认证失败会抛出异常
    return super.canActivate(context);
  }

  /**
   * 处理请求，对于公开路由，即使token无效也不抛出异常
   * 
   * @param err - 错误对象
   * @param user - 用户对象
   * @param info - 额外信息
   * @param context - 执行上下文
   * @returns 用户对象或null
   */
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    // 检查路由是否被@Public()装饰器标记为公开访问
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 如果是公开路由，即使认证失败也允许访问（user可能为undefined）
    if (isPublic) {
      return user || null;
    }

    // 对于非公开路由，使用父类的默认处理逻辑（会抛出异常）
    if (err || !user) {
      throw err || new UnauthorizedException('未授权');
    }
    return user;
  }
} 