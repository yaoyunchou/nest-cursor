import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NavigationService } from './navigation.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Menu } from './entities/menu.entity';
import { Permission } from './entities/permission.entity';
import { RoleCode } from '../role/entities/role.entity';
import { Roles } from '../role/decorators/roles.decorator';
import { RolesGuard } from '../role/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('导航与权限管理')
@Controller('navigation')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NavigationController {
  constructor(private readonly navigationService: NavigationService) {}

  // 菜单相关接口
  @Post('menu')
  @Roles(RoleCode.ADMIN)
  @ApiOperation({ summary: '创建菜单' })
  @ApiResponse({ status: 201, type: Menu })
  createMenu(@Body() createMenuDto: CreateMenuDto) {
    return this.navigationService.createMenu(createMenuDto);
  }

  @Get('menu/tree')
  @ApiOperation({ summary: '获取菜单树' })
  @ApiResponse({ status: 200, type: [Menu] })
  getMenuTree() {
    return this.navigationService.getMenuTree();
  }

  @Get('menu/role/:roleCode')
  @ApiOperation({ summary: '获取角色菜单' })
  @ApiResponse({ status: 200, type: [Menu] })
  getRoleMenus(@Param('roleCode') roleCode: RoleCode) {
    return this.navigationService.getRoleMenus(roleCode);
  }

  @Put('menu/:id')
  @Roles(RoleCode.ADMIN)
  @ApiOperation({ summary: '更新菜单' })
  @ApiResponse({ status: 200, type: Menu })
  updateMenu(@Param('id') id: string, @Body() updateMenuDto: UpdateMenuDto) {
    return this.navigationService.updateMenu(+id, updateMenuDto);
  }

  @Delete('menu/:id')
  @Roles(RoleCode.ADMIN)
  @ApiOperation({ summary: '删除菜单' })
  @ApiResponse({ status: 200 })
  removeMenu(@Param('id') id: string) {
    return this.navigationService.removeMenu(+id);
  }

  // 权限相关接口
  @Post('permission')
  @Roles(RoleCode.ADMIN)
  @ApiOperation({ summary: '创建权限' })
  @ApiResponse({ status: 201, type: Permission })
  createPermission(@Body() createPermissionDto: CreatePermissionDto) {
    return this.navigationService.createPermission(createPermissionDto);
  }

  @Get('permission')
  @ApiOperation({ summary: '获取权限列表' })
  @ApiResponse({ status: 200, type: [Permission] })
  findAllPermissions() {
    return this.navigationService.findAllPermissions();
  }

  @Get('permission/role/:roleCode')
  @ApiOperation({ summary: '获取角色权限' })
  @ApiResponse({ status: 200, type: [Permission] })
  getRolePermissions(@Param('roleCode') roleCode: RoleCode) {
    return this.navigationService.getRolePermissions(roleCode);
  }

  @Put('permission/:id')
  @Roles(RoleCode.ADMIN)
  @ApiOperation({ summary: '更新权限' })
  @ApiResponse({ status: 200, type: Permission })
  updatePermission(@Param('id') id: string, @Body() updatePermissionDto: UpdatePermissionDto) {
    return this.navigationService.updatePermission(+id, updatePermissionDto);
  }

  @Delete('permission/:id')
  @Roles(RoleCode.ADMIN)
  @ApiOperation({ summary: '删除权限' })
  @ApiResponse({ status: 200 })
  removePermission(@Param('id') id: string) {
    return this.navigationService.removePermission(+id);
  }

  // 角色分配相关接口
  @Post('role/:roleCode/menu/:menuId')
  @Roles(RoleCode.ADMIN)
  @ApiOperation({ summary: '为角色分配菜单' })
  assignMenuToRole(@Param('roleCode') roleCode: RoleCode, @Param('menuId') menuId: string) {
    return this.navigationService.assignMenuToRole(roleCode, +menuId);
  }

  @Delete('role/:roleCode/menu/:menuId')
  @Roles(RoleCode.ADMIN)
  @ApiOperation({ summary: '移除角色的菜单' })
  removeMenuFromRole(@Param('roleCode') roleCode: RoleCode, @Param('menuId') menuId: string) {
    return this.navigationService.removeMenuFromRole(roleCode, +menuId);
  }

  @Post('role/:roleCode/permission/:permissionId')
  @Roles(RoleCode.ADMIN)
  @ApiOperation({ summary: '为角色分配权限' })
  assignPermissionToRole(
    @Param('roleCode') roleCode: RoleCode,
    @Param('permissionId') permissionId: string,
  ) {
    return this.navigationService.assignPermissionToRole(roleCode, +permissionId);
  }

  @Delete('role/:roleCode/permission/:permissionId')
  @Roles(RoleCode.ADMIN)
  @ApiOperation({ summary: '移除角色的权限' })
  removePermissionFromRole(
    @Param('roleCode') roleCode: RoleCode,
    @Param('permissionId') permissionId: string,
  ) {
    return this.navigationService.removePermissionFromRole(roleCode, +permissionId);
  }
} 