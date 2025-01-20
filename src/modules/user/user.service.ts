/*
 * @Author: yaoyc yaoyunchou@bananain.com
 * @Date: 2025-01-16 15:30:44
 * @LastEditors: yaoyc yaoyunchou@bananain.com
 * @LastEditTime: 2025-01-16 15:30:44
 * @FilePath: \nest-cursor\src\modules\user\user.service.ts
 * @Description: 用户服务
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { PaginatedResponse } from '../../shared/interfaces/pagination.interface';
import { UserOrderBy } from './dto/query-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    return await this.userRepository.save(user);
  }

  async findAll(query: QueryUserDto): Promise<PaginatedResponse<User>> {
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
      list,
      total,
      pageSize,
      pageIndex,
    };
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['roles'],
    });
    
    if (!user) {
      throw new NotFoundException(`用户ID ${id} 不存在`);
    }
    return user;
  }

  async findByUsername(username: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { username },
      relations: ['roles'],
      select: ['id', 'username', 'password', 'email', 'status'],
    });
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    const updatedUser = Object.assign(user, updateUserDto);
    return await this.userRepository.save(updatedUser);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }
} 