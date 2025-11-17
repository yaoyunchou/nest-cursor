import { Injectable, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role, RoleCode } from './entities/role.entity';

@Injectable()
export class RoleService implements OnModuleInit {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async onModuleInit() {
    // 等待一小段时间确保数据库连接已建立
    await new Promise(resolve => setTimeout(resolve, 1000));
    await this.initializeRoles().catch(err => {
      console.error('Failed to initialize roles:', err);
    });
  }

  private async initializeRoles() {
    try {
      // 清理可能存在的空字符串记录
      await this.cleanupInvalidRoles();
      const roles = [
        {
          code: RoleCode.ADMIN,
          name: '管理员',
          description: '系统管理员，拥有所有权限',
        },
        {
          code: RoleCode.USER,
          name: '普通用户',
          description: '普通用户，拥有基本权限',
        },
        {
          code: RoleCode.TESTER,
          name: '测试用户',
          description: '测试用户，拥有测试相关权限',
        },
        {
          code: RoleCode.OPERATOR,
          name: '运营用户',
          description: '运营用户，拥有运营相关权限',
        },
      ];
      for (const roleData of roles) {
        const existingRole = await this.roleRepository.findOne({
          where: { code: roleData.code },
        });
        if (!existingRole) {
          console.log(`Creating role: ${roleData.name}`);
          await this.roleRepository.save(this.roleRepository.create(roleData));
        }
      }
    } catch (error) {
      console.error('Error initializing roles:', error);
      throw error;
    }
  }

  private async cleanupInvalidRoles() {
    try {
      // 使用原生查询查找并删除所有 code 为空字符串或 null 的记录
      // 先查询再删除，避免在删除时出现并发问题
      const invalidRoles = await this.roleRepository.query(
        `SELECT id FROM role WHERE code = '' OR code IS NULL`
      );
      if (invalidRoles && invalidRoles.length > 0) {
        // 确保所有 id 都是数字类型，防止 SQL 注入
        const ids = invalidRoles
          .map((r: any) => parseInt(r.id, 10))
          .filter((id: number) => !isNaN(id))
          .join(',');
        if (ids) {
          const result: any = await this.roleRepository.query(
            `DELETE FROM role WHERE id IN (${ids})`
          );
          const affectedRows = result?.affectedRows ?? 0;
          if (affectedRows > 0) {
            console.log(`Removed ${affectedRows} invalid role(s) with empty or null code`);
          }
        }
      }
    } catch (error) {
      // 如果查询失败，尝试直接删除
      try {
        const result: any = await this.roleRepository.query(
          `DELETE FROM role WHERE code = '' OR code IS NULL`
        );
        const affectedRows = result?.affectedRows ?? 0;
        if (affectedRows > 0) {
          console.log(`Removed ${affectedRows} invalid role(s) with empty or null code`);
        }
      } catch (deleteError) {
        console.warn('Could not cleanup invalid roles:', deleteError);
      }
    }
  }

  async findAll(): Promise<Role[]> {
    return await this.roleRepository.find();
  }

  async findOne(id: number): Promise<Role> {
    const role = await this.roleRepository.findOne({ 
      where: { id },
    });
    if (!role) {
      throw new NotFoundException(`角色ID ${id} 不存在`);
    }
    return role;
  }

  async findByCode(code: RoleCode): Promise<Role> {
    const role = await this.roleRepository.findOne({ where: { code } });
    if (!role) {
      throw new NotFoundException(`角色代码 ${code} 不存在`);
    }
    return role;
  }

  async create(roleData: Partial<Role>): Promise<Role> {
    if (!roleData.code) {
      throw new BadRequestException('角色编码不能为空');
    }
    // 验证 code 是否为有效的 RoleCode 枚举值
    const validCodes = Object.values(RoleCode);
    if (!validCodes.includes(roleData.code as RoleCode)) {
      throw new BadRequestException(`无效的角色编码: ${roleData.code}`);
    }
    // 检查 code 是否已存在
    const existingRole = await this.roleRepository.findOne({
      where: { code: roleData.code as RoleCode },
    });
    if (existingRole) {
      throw new BadRequestException(`角色编码 ${roleData.code} 已存在`);
    }
    const role = this.roleRepository.create(roleData);
    return await this.roleRepository.save(role);
  }

  async findUserRoles(userId: number): Promise<Role[]> {
    return this.roleRepository
      .createQueryBuilder('role')
      .innerJoin('role.users', 'user')
      .where('user.id = :userId', { userId })
      .getMany();
  }
} 