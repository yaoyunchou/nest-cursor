import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { NavigationService } from '../navigation.service';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private navigationService: NavigationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.get<string>('permission', context.getHandler());
    if (!requiredPermission) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user || !user.roles) {
      return false;
    }

    // 检查用户的每个角色是否有所需权限
    for (const role of user.roles) {
      const permissions = await this.navigationService.getRolePermissions(role);
      if (permissions.some(p => p.code === requiredPermission)) {
        return true;
      }
    }

    return false;
  }
} 