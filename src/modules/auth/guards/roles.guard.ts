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
    // 判断用户是否具有所需角色
    // user.roles 可能是字符串数组（如 ["admin"]）或对象数组（如 [{code: "admin", name: "管理员"}]）
    const userRoleCodes = user.roles
      .filter((role) => role != null)
      .map((role) => {
        // 如果是字符串，直接返回
        if (typeof role === 'string') {
          return role.toLowerCase();
        }
        // 如果是对象，优先使用 code 字段
        if (typeof role === 'object' && role.code) {
          return role.code.toLowerCase();
        }
        // 如果是对象但没有 code，使用 name 字段并通过映射表转换
        if (typeof role === 'object' && role.name) {
          const mappedCode = ROLE_NAME_TO_CODE_MAP[role.name];
          return mappedCode ? mappedCode.toLowerCase() : role.name.toLowerCase();
        }
        return null;
      })
      .filter((code) => code != null);
    const result: boolean = requiredRoles.some((role) => {
      const normalizedRole = role.toLowerCase();
      return userRoleCodes.includes(normalizedRole);
    });
    return result;
  }
} 