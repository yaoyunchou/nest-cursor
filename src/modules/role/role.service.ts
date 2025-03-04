import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role, RoleCode } from './entities/role.entity';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {
    this.initializeRoles().catch(err => {
      console.error('Failed to initialize roles:', err);
    });
  }

  private async initializeRoles() {
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