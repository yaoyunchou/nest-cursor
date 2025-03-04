/*
 * @Author: yaoyc yaoyunchou@bananain.com
 * @Date: 2025-01-16 15:30:44
 * @LastEditors: yaoyc yaoyunchou@bananain.com
 * @LastEditTime: 2025-01-16 15:30:44
 * @FilePath: \nest-cursor\src\modules\user\user.service.ts
 * @Description: 用户服务
 */
import { Injectable, NotFoundException, UnauthorizedException, ClassSerializerInterceptor, UseInterceptors, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { PaginatedResponse } from '../../shared/interfaces/pagination.interface';
import { UserOrderBy } from './dto/query-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import * as bcrypt from 'bcrypt';
import { RoleService } from '../role/role.service';
import { RoleCode } from '../role/entities/role.entity';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
@UseInterceptors(ClassSerializerInterceptor)
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly roleService: RoleService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    try {
      // 检查传入的数据是否有角色存在，没有则默认为用户角色
    if (!createUserDto.roleIds || createUserDto?.roleIds?.length === 0) { 
      const userRole = await this.roleService.findByCode(RoleCode.USER);
      createUserDto.roleIds = [userRole.id];
    }

    // 创建用户对密码进行加密
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    
    // 获取角色实体
    const roles = await Promise.all(
      createUserDto.roleIds.map(id => this.roleService.findOne(id))
    );

    // 创建用户实体
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      roles,
    });

    const savedUser = await this.userRepository.save(user);
    return new UserResponseDto(savedUser);
    } catch (error) {
      throw new BadRequestException(error);
    }
    
  }

  async findAll(query: QueryUserDto): Promise<PaginatedResponse<UserResponseDto>> {
    const { 
      pageIndex = 1, 
      pageSize = 10, 
      username, 
      email, 
      status,
      orderBy = UserOrderBy.ID,
      order = 'DESC'
    } = query;
    
    const queryBuilder = this.userRepository.createQueryBuilder('user')
      .select([
        'user.id',
        'user.username',
        'user.email',
        'user.status',
        'user.createdAt',
      ])
      .leftJoinAndSelect('user.roles', 'role')

    if (username) {
      queryBuilder.andWhere('user.username LIKE :username', { username: `%${username}%` });
    }

    if (email) {
      queryBuilder.andWhere('user.email LIKE :email', { email: `%${email}%` });
    }

    if (status !== undefined) {
      queryBuilder.andWhere('user.status = :status', { status });
    }

    queryBuilder.orderBy(`user.${orderBy}`, order);

    const [list, total] = await queryBuilder
      .skip((pageIndex - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return {
      list: list.map(user => new UserResponseDto(user)),
      total,
      pageSize,
      pageIndex,
    };
  }

  async findOne(id: number): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['roles'],
    });
    if (!user) {
      throw new NotFoundException(`用户ID ${id} 不存在`);
    }
    return new UserResponseDto(user);
  }

  async findByUsername(username: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { username },
      relations: ['roles'],
      select: ['id', 'username', 'password', 'email', 'status'],
    });
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const existingUser = await this.userRepository.findOne({
      where: { id },
      relations: ['roles']
    });
    if (!existingUser) {
      throw new NotFoundException(`用户ID ${id} 不存在`);
    }
    
    const updatedUser = await this.userRepository.save({
      ...existingUser,
      ...updateUserDto
    });
    
    return new UserResponseDto(updatedUser);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }

  async updatePassword(userId: number, updatePasswordDto: UpdatePasswordDto): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'password', 'username', 'email', 'status'],
    });

    if (!user) {
      throw new NotFoundException(`用户ID ${userId} 不存在`);
    }

    const isPasswordValid = await bcrypt.compare(
      updatePasswordDto.oldPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('旧密码错误');
    }

    const hashedPassword = await bcrypt.hash(updatePasswordDto.newPassword, 10);
    
    user.password = hashedPassword;
    const savedUser = await this.userRepository.save(user);
    return new UserResponseDto(savedUser);
  }
  // findByOpenid
  async findByOpenid(openid: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { openid },
    });
    return user;
  }
  
  async assignRole(userId: number, roleCode: RoleCode): Promise<UserResponseDto> {
    const existingUser = await this.findOne(userId);
    const role = await this.roleService.findByCode(roleCode);
    
    if (!existingUser.roles) {
      existingUser.roles = [];
    }
    
    if (!existingUser.roles.find(r => r.code === roleCode)) {
      existingUser.roles.push(role);
      const updatedUser = await this.userRepository.save(existingUser);
      return new UserResponseDto(updatedUser);
    }
    
    return new UserResponseDto(existingUser);
  }

  async removeRole(userId: number, roleCode: RoleCode): Promise<UserResponseDto> {
    const user = await this.findOne(userId);
    user.roles = user.roles.filter(role => role.code !== roleCode);
    const savedUser = await this.userRepository.save(user);
    return new UserResponseDto(savedUser);
  }

  async getUserRoles(userId: number): Promise<RoleCode[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });
    return user.roles.map(role => role.code);
  }

  async resetPassword(user: UserResponseDto, id: number): Promise<void> {
    // 获取user的roles
    const roles = user.roles;   
    // 判断当前用户是否是管理员
    if(!roles.some(role => role === RoleCode.ADMIN)) {
      throw new UnauthorizedException('无权限重置密码');
    }
    // 获取需要重置密码的用户
    const currentUser = await this.userRepository.findOne({
      where: { id },
    });
    // 重置密码
    currentUser.password = await bcrypt.hash('2025@xfy', 10);
    await this.userRepository.save(currentUser);
  }
} 