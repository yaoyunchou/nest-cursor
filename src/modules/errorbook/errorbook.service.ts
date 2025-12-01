import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Like } from 'typeorm';
import { ErrorBook } from './entities/errorbook.entity';
import { CreateErrorBookDto } from './dto/create-errorbook.dto';
import { UpdateErrorBookDto } from './dto/update-errorbook.dto';
import { QueryErrorBookDto } from './dto/query-errorbook.dto';
import { PaginatedResponse } from '../../shared/interfaces/pagination.interface';

/**
 * 错题本服务
 */
@Injectable()
export class ErrorBookService {
  constructor(
    @InjectRepository(ErrorBook)
    private readonly errorBookRepository: Repository<ErrorBook>,
  ) {}

  /**
   * 创建错题记录
   * @param createErrorBookDto - 错题创建数据
   * @param userId - 用户ID
   * @returns 创建的错题实体
   */
  async create(createErrorBookDto: CreateErrorBookDto, userId: number): Promise<ErrorBook> {
    const errorBook = this.errorBookRepository.create({
      ...createErrorBookDto,
      user: { id: userId } as any,
    });
    return await this.errorBookRepository.save(errorBook);
  }

  /**
   * 分页查询错题列表
   * @param query - 查询参数
   * @param userId - 用户ID
   * @returns 分页后的错题列表
   */
  async findAll(query: QueryErrorBookDto, userId: number): Promise<PaginatedResponse<ErrorBook>> {
    const { pageIndex = 1, pageSize = 10, subject } = query;
    const skip = (pageIndex - 1) * pageSize;
    const where: FindOptionsWhere<ErrorBook> = {
      user: { id: userId },
    };
    if (subject) {
      where.subject = Like(`%${subject}%`);
    }
    const [list, total] = await this.errorBookRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip,
      take: pageSize,
      relations: ['user'],
    });
    return {
      list,
      total,
      pageIndex,
      pageSize,
    };
  }

  /**
   * 根据ID查询单个错题
   * @param id - 错题ID
   * @param userId - 用户ID
   * @returns 错题实体
   */
  async findOne(id: number, userId: number): Promise<ErrorBook> {
    const errorBook = await this.errorBookRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['user'],
    });
    if (!errorBook) {
      throw new NotFoundException(`错题ID ${id} 不存在`);
    }
    return errorBook;
  }

  /**
   * 更新错题记录
   * @param id - 错题ID
   * @param updateErrorBookDto - 更新数据
   * @param userId - 用户ID
   * @returns 更新后的错题实体
   */
  async update(id: number, updateErrorBookDto: UpdateErrorBookDto, userId: number): Promise<ErrorBook> {
    const errorBook = await this.findOne(id, userId);
    Object.assign(errorBook, updateErrorBookDto);
    return await this.errorBookRepository.save(errorBook);
  }

  /**
   * 删除错题记录
   * @param id - 错题ID
   * @param userId - 用户ID
   */
  async remove(id: number, userId: number): Promise<void> {
    const errorBook = await this.findOne(id, userId);
    await this.errorBookRepository.remove(errorBook);
  }

  /**
   * 统计用户错题数量
   * @param userId - 用户ID
   * @returns 错题统计信息
   */
  async getStatistics(userId: number): Promise<{ total: number; today: number }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [total, todayCount] = await Promise.all([
      this.errorBookRepository.count({
        where: { user: { id: userId } },
      }),
      this.errorBookRepository
        .createQueryBuilder('errorbook')
        .where('errorbook.user_id = :userId', { userId })
        .andWhere('DATE(errorbook.createdAt) = DATE(:today)', { today })
        .getCount(),
    ]);
    return {
      total,
      today: todayCount,
    };
  }
  /**
   * 获取错题本统计概览
   * @param userId - 用户ID
   * @returns 错题本统计概览
   */
  async getStatisticsSummary(userId: number): Promise<{ total: number; week: number; month: number; today: number }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const week = new Date();
    week.setHours(0, 0, 0, 0);
    week.setDate(week.getDate() - 7);
    const month = new Date();
    month.setHours(0, 0, 0, 0);
    month.setDate(month.getDate() - 30);
    const [total, weekCount, monthCount, todayCount] = await Promise.all([
      this.errorBookRepository.count({
        where: { user: { id: userId } },
      }),
      this.errorBookRepository
        .createQueryBuilder('errorbook')
        .where('errorbook.user_id = :userId', { userId })
        .andWhere('DATE(errorbook.createdAt) = DATE(:week)', { week })
        .getCount(),
      this.errorBookRepository
        .createQueryBuilder('errorbook')
        .where('errorbook.user_id = :userId', { userId })
        .andWhere('DATE(errorbook.createdAt) = DATE(:month)', { month })
        .getCount(),
      this.errorBookRepository
        .createQueryBuilder('errorbook')
        .where('errorbook.user_id = :userId', { userId })
        .andWhere('DATE(errorbook.createdAt) = DATE(:today)', { today })
        .getCount(),
    ]);
    return {
      total,
      week: weekCount,
      month: monthCount,
      today: todayCount,
    };
  }
}

