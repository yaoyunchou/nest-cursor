/*
 * @Author: yaoyc yaoyunchou@bananain.com
 * @Date: 2025-01-16 15:50:44
 * @LastEditors: yaoyc yaoyunchou@bananain.com
 * @LastEditTime: 2025-01-16 15:50:44
 * @FilePath: \nest-cursor\src\modules\auth\guards\roles.guard.ts
 * @Description: 角色守卫
 */
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * 角色名称到代码的映射
 * 将数据库中的中文角色名称映射到代码中使用的英文代码
 */
const ROLE_NAME_TO_CODE_MAP: Record<string, string> = {
  '管理员': 'admin',
  '编辑': 'editor',
  '用户': 'user',
  '访客': 'visitor',
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    // 判断用户是否具有所需角色
    const result:boolean = requiredRoles.some((role) => {
 

      const currentRole = user.roles.map((item) => item.name.toLowerCase());
      return currentRole?.includes(role);
    });
    return result;
  }
} 