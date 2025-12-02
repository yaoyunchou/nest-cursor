import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Between, LessThan, MoreThan } from 'typeorm';
import { ReadingTask } from './entities/reading-task.entity';
import { CreateReadingTaskDto } from './dto/create-reading-task.dto';
import { UpdateReadingTaskDto } from './dto/update-reading-task.dto';
import { QueryReadingTaskDto } from './dto/query-reading-task.dto';
import { ListResponse } from '@/models/list-response.model';

/**
 * 读书任务服务
 * 负责处理读书任务的业务逻辑
 */
@Injectable()
export class ReadingTaskService {
  constructor(
    @InjectRepository(ReadingTask)
    private readonly readingTaskRepository: Repository<ReadingTask>,
  ) {}

  /**
   * 计算任务状态
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @returns 任务状态
   */
  private calculateStatus(startDate: Date, endDate: Date): string {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);
    if (today < start) {
      return 'pending';
    } else if (today >= start && today <= end) {
      return 'in_progress';
    } else {
      return 'completed';
    }
  }

  /**
   * 计算总打卡次数
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @returns 总打卡次数
   */
  private calculateTotalCheckIns(startDate: Date, endDate: Date): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  }

  /**
   * 创建读书任务
   * @param createReadingTaskDto 创建任务DTO
   * @param userId 用户ID
   * @returns 创建的任务
   */
  async create(createReadingTaskDto: CreateReadingTaskDto, userId: number): Promise<ReadingTask> {
    const startDate = new Date(createReadingTaskDto.startDate);
    const endDate = new Date(createReadingTaskDto.endDate);
    if (startDate > endDate) {
      throw new BadRequestException('开始日期不能晚于结束日期');
    }
    const status = this.calculateStatus(startDate, endDate);
    const totalCheckIns = this.calculateTotalCheckIns(startDate, endDate);
    const task = this.readingTaskRepository.create({
      name: createReadingTaskDto.name,
      startDate,
      endDate,
      status,
      totalCheckIns,
      completedCheckIns: 0,
      user: { id: userId } as any,
    });
    return await this.readingTaskRepository.save(task);
  }

  /**
   * 获取任务列表
   * @param query 查询参数
   * @param userId 用户ID
   * @param isAdmin 是否为管理员，管理员可以查看所有数据
   * @returns 任务列表
   */
  async findAll(query: QueryReadingTaskDto, userId: number, isAdmin: boolean = false): Promise<ListResponse<ReadingTask>> {
    const { page = 1, pageSize = 10, status } = query;
    const where: FindOptionsWhere<ReadingTask> = {};
    if (!isAdmin) {
      where.user = { id: userId };
    }
    if (status) {
      where.status = status;
    }
    const [list, total] = await this.readingTaskRepository.findAndCount({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: {
        createdAt: 'DESC',
      },
    });
    return {
      total,
      page,
      pageSize,
      list,
    };
  }

  /**
   * 获取任务详情
   * @param id 任务ID
   * @param userId 用户ID
   * @param isAdmin 是否为管理员，管理员可以查看所有数据
   * @returns 任务详情
   */
  async findOne(id: number, userId: number, isAdmin: boolean = false): Promise<ReadingTask> {
    const where: FindOptionsWhere<ReadingTask> = { id };
    if (!isAdmin) {
      where.user = { id: userId };
    }
    const task = await this.readingTaskRepository.findOne({
      where,
      relations: ['checkins'],
    });
    if (!task) {
      throw new NotFoundException(`任务ID ${id} 未找到`);
    }
    return task;
  }

  /**
   * 更新任务
   * @param id 任务ID
   * @param updateReadingTaskDto 更新任务DTO
   * @param userId 用户ID
   * @returns 更新后的任务
   */
  async update(id: number, updateReadingTaskDto: UpdateReadingTaskDto, userId: number): Promise<ReadingTask> {
    const task = await this.findOne(id, userId);
    if (updateReadingTaskDto.startDate || updateReadingTaskDto.endDate) {
      const startDate = updateReadingTaskDto.startDate ? new Date(updateReadingTaskDto.startDate) : task.startDate;
      const endDate = updateReadingTaskDto.endDate ? new Date(updateReadingTaskDto.endDate) : task.endDate;
      if (startDate > endDate) {
        throw new BadRequestException('开始日期不能晚于结束日期');
      }
      task.startDate = startDate;
      task.endDate = endDate;
      task.status = this.calculateStatus(startDate, endDate);
      task.totalCheckIns = this.calculateTotalCheckIns(startDate, endDate);
    }
    if (updateReadingTaskDto.name) {
      task.name = updateReadingTaskDto.name;
    }
    return await this.readingTaskRepository.save(task);
  }

  /**
   * 删除任务
   * @param id 任务ID
   * @param userId 用户ID
   */
  async remove(id: number, userId: number): Promise<void> {
    const task = await this.findOne(id, userId);
    await this.readingTaskRepository.remove(task);
  }

  /**
   * 更新任务的已完成打卡次数
   * @param taskId 任务ID
   */
  async updateCompletedCheckIns(taskId: number): Promise<void> {
    const task = await this.readingTaskRepository.findOne({
      where: { id: taskId },
      relations: ['checkins'],
    });
    if (task) {
      task.completedCheckIns = task.checkins?.length || 0;
      await this.readingTaskRepository.save(task);
    }
  }
}

