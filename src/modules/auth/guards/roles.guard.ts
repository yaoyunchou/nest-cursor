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
    if (!user || !user.roles || !Array.isArray(user.roles)) {
      return false;
    }
    // 将用户角色名称转换为代码（支持中文名称映射）
    const userRoleCodes = user.roles.map((role) => {
      const roleName = role.name?.toLowerCase() || '';
      // 先尝试直接匹配（如果数据库存储的就是英文代码）
      if (requiredRoles.includes(roleName)) {
        return roleName;
      }
      // 尝试通过映射表转换中文名称
      return ROLE_NAME_TO_CODE_MAP[role.name] || roleName;
    });
    // 判断用户是否具有所需角色
    const result = requiredRoles.some((requiredRole) => {
      return userRoleCodes.includes(requiredRole.toLowerCase());
    });
    return result;
  }
} 