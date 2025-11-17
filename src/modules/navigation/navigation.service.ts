import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TreeRepository } from 'typeorm';
import { Menu } from './entities/menu.entity';
import { Permission } from './entities/permission.entity';
import { RoleCode } from '../role/entities/role.entity';
import { CreateMenuDto } from './dto/create-menu.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { RoleService } from '../role/role.service';

@Injectable()
export class NavigationService {
  constructor(
    @InjectRepository(Menu)
    private menuRepository: TreeRepository<Menu>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    private roleService: RoleService,
  ) {}

  async createMenu(createMenuDto: CreateMenuDto): Promise<Menu> {
    const menu = this.menuRepository.create(createMenuDto);
    if (createMenuDto.parentId) {
      const parent = await this.menuRepository.findOne({ where: { id: createMenuDto.parentId } });
      if (!parent) {
        throw new NotFoundException(`父菜单ID ${createMenuDto.parentId} 不存在`);
      }
      menu.parent = parent;
    }
    return await this.menuRepository.save(menu);
  }

  async getMenuTree(): Promise<Menu[]> {
    return await this.menuRepository.findTrees();
  }

  async getRoleMenus(roleCode: RoleCode): Promise<Menu[]> {
    const menus = await this.menuRepository
      .createQueryBuilder('menu')
      .leftJoinAndSelect('menu.roles', 'role')
      .where('role.code = :roleCode', { roleCode })
      .getMany();

    return this.buildMenuTree(menus);
  }

  private buildMenuTree(menus: Menu[], parentId: number = null): Menu[] {
    const tree: Menu[] = [];
    menus.forEach(menu => {
      if (menu.parent?.id === parentId) {
        const children = this.buildMenuTree(menus, menu.id);
        if (children.length) {
          menu.children = children;
        }
        tree.push(menu);
      }
    });
    return tree;
  }

  async createPermission(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    const permission = this.permissionRepository.create(createPermissionDto);
    return await this.permissionRepository.save(permission);
  }

  async getRolePermissions(roleCode: RoleCode): Promise<Permission[]> {
    return await this.permissionRepository
      .createQueryBuilder('permission')
      .leftJoinAndSelect('permission.roles', 'role')
      .where('role.code = :roleCode', { roleCode })
      .getMany();
  }

  async updateMenu(id: number, updateMenuDto: UpdateMenuDto): Promise<Menu> {
    const menu = await this.menuRepository.findOne({ where: { id } });
    if (!menu) {
      throw new NotFoundException(`菜单ID ${id} 不存在`);
    }

    if (updateMenuDto.parentId) {
      const parent = await this.menuRepository.findOne({ 
        where: { id: updateMenuDto.parentId } 
      });
      if (!parent) {
        throw new NotFoundException(`父菜单ID ${updateMenuDto.parentId} 不存在`);
      }
      menu.parent = parent;
    }

    Object.assign(menu, updateMenuDto);
    return await this.menuRepository.save(menu);
  }

  async removeMenu(id: number): Promise<void> {
    const menu = await this.menuRepository.findOne({ 
      where: { id },
      relations: ['children'] 
    });
    if (!menu) {
      throw new NotFoundException(`菜单ID ${id} 不存在`);
    }

    if (menu.children?.length > 0) {
      throw new BadRequestException('不能删除有子菜单的菜单');
    }

    await this.menuRepository.remove(menu);
  }

  async findAllPermissions(): Promise<Permission[]> {
    return await this.permissionRepository.find();
  }

  async updatePermission(id: number, updatePermissionDto: UpdatePermissionDto): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({ where: { id } });
    if (!permission) {
      throw new NotFoundException(`权限ID ${id} 不存在`);
    }

    Object.assign(permission, updatePermissionDto);
    return await this.permissionRepository.save(permission);
  }

  async removePermission(id: number): Promise<void> {
    const permission = await this.permissionRepository.findOne({ where: { id } });
    if (!permission) {
      throw new NotFoundException(`权限ID ${id} 不存在`);
    }

    await this.permissionRepository.remove(permission);
  }

  async assignMenuToRole(roleCode: RoleCode, menuId: number): Promise<void> {
    const role = await this.roleService.findByCode(roleCode);
    const menu = await this.menuRepository.findOne({ where: { id: menuId } });
    
    if (!menu) {
      throw new NotFoundException(`菜单ID ${menuId} 不存在`);
    }

    if (!menu.roles) {
      menu.roles = [];
    }

    if (!menu.roles.find(r => r.code === roleCode)) {
      menu.roles.push(role);
      await this.menuRepository.save(menu);
    }
  }

  async removeMenuFromRole(roleCode: RoleCode, menuId: number): Promise<void> {
    const menu = await this.menuRepository.findOne({
      where: { id: menuId },
      relations: ['roles'],
    });
    
    if (!menu) {
      throw new NotFoundException(`菜单ID ${menuId} 不存在`);
    }

    menu.roles = menu.roles.filter(role => role.code !== roleCode);
    await this.menuRepository.save(menu);
  }

  async assignPermissionToRole(roleCode: RoleCode, permissionId: number): Promise<void> {
    const role = await this.roleService.findByCode(roleCode);
    const permission = await this.permissionRepository.findOne({ 
      where: { id: permissionId } 
    });
    
    if (!permission) {
      throw new NotFoundException(`权限ID ${permissionId} 不存在`);
    }

    if (!permission.roles) {
      permission.roles = [];
    }

    if (!permission.roles.find(r => r.code === roleCode)) {
      permission.roles.push(role);
      await this.permissionRepository.save(permission);
    }
  }

  async removePermissionFromRole(roleCode: RoleCode, permissionId: number): Promise<void> {
    const permission = await this.permissionRepository.findOne({
      where: { id: permissionId },
      relations: ['roles'],
    });
    
    if (!permission) {
      throw new NotFoundException(`权限ID ${permissionId} 不存在`);
    }

    permission.roles = permission.roles.filter(role => role.code !== roleCode);
    await this.permissionRepository.save(permission);
  }
} 