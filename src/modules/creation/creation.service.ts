/*
 * @Author: yaoyc yaoyunchou@bananain.com
 * @Date: 2025-01-18 10:00:44
 * @LastEditors: yaoyc yaoyunchou@bananain.com
 * @LastEditTime: 2025-01-18 10:00:44
 * @FilePath: \nest-cursor\src\modules\creation\creation.service.ts
 * @Description: 创作服务
 */
import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Creation } from './entities/creation.entity';
import { UserCollection } from './entities/user-collection.entity';
import { CreateCreationDto } from './dto/create-creation.dto';
import { UpdateCreationDto } from './dto/update-creation.dto';
import { QueryCreationDto, SortField, SortOrder } from './dto/query-creation.dto';
import { QueryCollectionDto } from './dto/query-collection.dto';
import { PaginatedResponse } from '../../shared/interfaces/pagination.interface';

@Injectable()
export class CreationService {
  constructor(
    @InjectRepository(Creation)
    private readonly creationRepository: Repository<Creation>,
    @InjectRepository(UserCollection)
    private readonly userCollectionRepository: Repository<UserCollection>,
  ) {}

  /**
   * 创建作品
   * @param createCreationDto - 创建作品的数据
   * @param userId - 创建人ID
   * @returns 创建的作品实体
   */
  async create(createCreationDto: CreateCreationDto, userId: number): Promise<Creation> {
    const creation = this.creationRepository.create({
      ...createCreationDto,
      user: { id: userId },
      images: createCreationDto.images || [],
    });

    return await this.creationRepository.save(creation);
  }

  /**
   * 分页查询作品列表
   * @param query - 查询参数
   * @param currentUserId - 当前用户ID（用于权限控制）
   * @returns 分页后的作品列表
   */
  async findAll(query: QueryCreationDto, currentUserId?: number, isAdmin: boolean=true): Promise<PaginatedResponse<Creation>> {
    const { title, prompt, status, user, page, pageSize } = query;
    
    // 创建查询构建器
    const queryBuilder = this.creationRepository.createQueryBuilder('creation');
    if (isAdmin) {
      queryBuilder.leftJoinAndSelect('creation.user', 'user');
    }

    // 权限控制：如果不是查询自己的作品，只能查看公开作品
    if (user && user.id !== currentUserId) {
      queryBuilder.andWhere('creation.status = :status', { status: 1 });
    } else if (!user && currentUserId) {
      // 如果没有指定userId但有当前用户，查询当前用户的所有作品
      queryBuilder.andWhere('creation.userId = :currentUserId', { currentUserId });
    } else if (!user && !currentUserId) {
      // 如果都没有指定，只查询公开作品
      queryBuilder.andWhere('creation.status = :status', { status: 1 });
    }

    // 按标题模糊查询
    if (title) {
      queryBuilder.andWhere('creation.title LIKE :title', { title: `%${title}%` });
    }

    // 按提示词模糊查询
    if (prompt) {
      queryBuilder.andWhere('creation.prompt LIKE :prompt', { prompt: `%${prompt}%` });
    }

    // 按公开状态筛选
    if (status !== undefined) {
      queryBuilder.andWhere('creation.status = :status', { status });
    }

    // 按指定用户筛选
    if (user) {
      queryBuilder.andWhere('creation.user.id = :userId', { userId: user.id });
    }

    // 按排序字段进行排序
    if (query.sort) {
      queryBuilder.orderBy(`creation.${query.sort}`, query.sortOrder);
    }



    // 分页
    const skip = (page - 1) * pageSize;
    queryBuilder.skip(skip).take(pageSize);

    // 执行查询
    const [list, total] = await queryBuilder.getManyAndCount();

    return {
      list,
      total,
      pageSize: pageSize,
      pageIndex: page,
    };
  }

  /**
   * 获取公开作品广场列表
   * @param query - 查询参数
   * @returns 公开作品列表
   */
  async findPublicCreations(query: QueryCreationDto): Promise<PaginatedResponse<Creation>> {
    const queryWithPublic = { ...query, status: 1 };
    // 希望安装createAt 来进行排序
    queryWithPublic.sort = SortField.CREATED_AT;
    queryWithPublic.sortOrder= SortOrder.DESC;
    return this.findAll(queryWithPublic, null, false);
  }

  /**
   * 根据ID查询单个作品
   * @param id - 作品ID
   * @param currentUserId - 当前用户ID
   * @returns 作品实体
   */
  async findOne(id: number, currentUserId?: number): Promise<Creation> {
    const creation = await this.creationRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    
    if (!creation) {
      throw new NotFoundException(`作品ID ${id} 不存在`);
    }

    // 权限控制：只有创建者可以查看私有作品
    if (creation.status !== 1 && creation.user.id !== currentUserId) {
      throw new ForbiddenException('无权查看此作品');
    }

    return creation;
  }

  /**
   * 更新作品信息
   * @param id - 作品ID
   * @param updateCreationDto - 更新数据
   * @param userId - 当前用户ID
   * @returns 更新后的作品实体
   */
  async update(id: number, updateCreationDto: UpdateCreationDto, userId: number): Promise<Creation> {
    const creation = await this.findOne(id, userId);
    
    // 权限验证：只有创建者可以更新
    if (creation.user.id !== userId) {
      throw new ForbiddenException('无权修改此作品');
    }

    // 合并更新数据
    Object.assign(creation, updateCreationDto);
    
    return await this.creationRepository.save(creation);
  }

  /**
   * 删除作品
   * @param id - 作品ID
   * @param userId - 当前用户ID
   */
  async remove(id: number, userId: number): Promise<void> {
    const creation = await this.findOne(id, userId);
    
    // 权限验证：只有创建者可以删除
    if (creation.user.id !== userId) {
      throw new ForbiddenException('无权删除此作品');
    }

    // 删除相关收藏记录
    await this.userCollectionRepository.delete({ creation: { id } });
    
    // 删除作品
    await this.creationRepository.remove(creation);
  }

  /**
   * 切换作品公开状态
   * @param id - 作品ID
   * @param userId - 当前用户ID
   * @returns 更新后的作品实体
   */
  async togglePublic(id: number, userId: number): Promise<Creation> {
    const creation = await this.findOne(id, userId);
    
    // 权限验证：只有创建者可以切换公开状态
    if (creation.user.id !== userId) {
      throw new ForbiddenException('无权修改此作品的公开状态');
    }

    creation.status = 2;
    return await this.creationRepository.save(creation);
  }

  /**
   * 点赞作品
   * @param id - 作品ID
   * @param userId - 当前用户ID
   * @returns 更新后的作品实体
   */
  async likeCreation(id: number, userId: number): Promise<Creation> {
    const creation = await this.findOne(id);
    
    // 验证作品是否公开
    if (creation.status !==1) {
      throw new ForbiddenException('只能对公开作品进行点赞');
    }

    // 不能对自己的作品点赞
    if (creation.user.id === userId) {
      throw new ForbiddenException('不能对自己的作品进行点赞');
    }

    // 增加点赞数
    creation.likes += 1;
    
    return await this.creationRepository.save(creation);
  }

  /**
   * 取消点赞作品
   * @param id - 作品ID
   * @param userId - 当前用户ID
   * @returns 更新后的作品实体
   */
  async unlikeCreation(id: number, userId: number): Promise<Creation> {
    const creation = await this.findOne(id);
    
    // 验证作品是否公开
    if (creation.status !== 1) {
      throw new ForbiddenException('只能对公开作品取消点赞');
    }

    // 不能对自己的作品操作
    if (creation.user.id === userId) {
      throw new ForbiddenException('不能对自己的作品进行操作');
    }

    // 减少点赞数，确保不会小于0
    creation.likes = Math.max(0, creation.likes - 1);
    
    return await this.creationRepository.save(creation);
  }

  /**
   * 收藏作品
   * @param id - 作品ID
   * @param userId - 当前用户ID
   * @returns 收藏记录
   */
  async collectCreation(id: number, userId: number): Promise<UserCollection> {
    const creation = await this.findOne(id);
    
    // 验证作品是否公开
    if (creation.status !== 1) {
      throw new ForbiddenException('只能收藏公开的作品');
    }

    // 不能收藏自己的作品
    if (creation.user.id === userId) {
      throw new ForbiddenException('不能收藏自己的作品');
    }

    // 检查是否已经收藏
    const existingCollection = await this.userCollectionRepository.findOne({
      where: { user: { id: userId }, creation: { id } },
    });

    if (existingCollection) {
      throw new ConflictException('已经收藏过此作品');
    }

    // 创建收藏记录
    const collection = this.userCollectionRepository.create({
      user: { id: userId },
      creation: { id },
    });

    // 增加收藏数
    creation.collections += 1;
    await this.creationRepository.save(creation);

    return await this.userCollectionRepository.save(collection);
  }

  /**
   * 取消收藏作品
   * @param id - 作品ID
   * @param userId - 当前用户ID
   */
  async uncollectCreation(id: number, userId: number): Promise<void> {
    const creation = await this.findOne(id);

    // 查找收藏记录
    const collection = await this.userCollectionRepository.findOne({
      where: { user: { id: userId }, creation: { id } },
    });

    if (!collection) {
      throw new NotFoundException('未收藏此作品');
    }

    // 删除收藏记录
    await this.userCollectionRepository.remove(collection);

    // 减少收藏数，确保不会小于0
    creation.collections = Math.max(0, creation.collections - 1);
    await this.creationRepository.save(creation);
  }

  /**
   * 获取用户收藏列表
   * @param userId - 用户ID
   * @param query - 查询参数
   * @returns 用户收藏的作品列表
   */
  async getUserCollections(userId: number, query: QueryCollectionDto): Promise<PaginatedResponse<UserCollection>> {
    const { page, pageSize } = query;
    
    // 创建查询构建器, user只展示id和username
    const queryBuilder = this.userCollectionRepository.createQueryBuilder('collection')
      .leftJoinAndSelect('collection.creation', 'creation')
      .leftJoinAndSelect('creation.user', 'user', 'user.id = creation.userId')
      .select(['collection.id', 'collection.createdAt', 'creation.id', 'creation.title', 'creation.images', 'creation.likes', 'creation.collections', 'user.id', 'user.username'])
      .where('collection.userId = :userId', { userId })
      .andWhere('creation.status = :status', { status: 1 }) // 只查询公开作品的收藏
      .orderBy('collection.createdAt', 'DESC');

    // 分页
    const skip = (page - 1) * pageSize;
    queryBuilder.skip(skip).take(pageSize);

    // 执行查询
    const [list, total] = await queryBuilder.getManyAndCount();

    return {
      list,
      total,
      pageSize: pageSize,
      pageIndex: page,
    };
  }
} 