/*
 * @Description: 通知任务服务
 */
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Like } from 'typeorm';
import { NotificationTask, ScheduleType, TaskStatus } from './entities/notification-task.entity';
import { CreateNotificationTaskDto } from './dto/create-notification-task.dto';
import { UpdateNotificationTaskDto } from './dto/update-notification-task.dto';
import { QueryNotificationTaskDto } from './dto/query-notification-task.dto';
import * as dayjs from 'dayjs';

/**
 * 通知任务服务
 */
@Injectable()
export class NotificationTaskService {
  constructor(
    @InjectRepository(NotificationTask)
    private readonly taskRepository: Repository<NotificationTask>,
  ) {}

  /**
   * 创建通知任务
   */
  async create(createDto: CreateNotificationTaskDto): Promise<NotificationTask> {
    const task = this.taskRepository.create(createDto);
    task.nextExecuteAt = this.calculateNextExecuteAt(task.scheduleType, task.scheduleConfig);
    return await this.taskRepository.save(task);
  }

  /**
   * 查询任务列表
   */
  async findAll(query: QueryNotificationTaskDto): Promise<{ list: NotificationTask[]; total: number; pageSize: number; pageIndex: number }> {
    const { pageSize = 10, pageIndex = 1, userId, channel, status } = query;
    const where: FindOptionsWhere<NotificationTask> = {};
    if (userId) {
      where.userId = userId;
    }
    if (channel) {
      where.channel = channel;
    }
    if (status) {
      where.status = status;
    }
    const [list, total] = await this.taskRepository.findAndCount({
      where,
      relations: ['user'],
      skip: (pageIndex - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });
    return {
      list,
      total,
      pageSize,
      pageIndex,
    };
  }

  /**
   * 查询单个任务
   */
  async findOne(id: number): Promise<NotificationTask> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!task) {
      throw new NotFoundException(`任务ID ${id} 未找到`);
    }
    return task;
  }

  /**
   * 更新任务
   */
  async update(id: number, updateDto: UpdateNotificationTaskDto): Promise<NotificationTask> {
    const task = await this.findOne(id);
    Object.assign(task, updateDto);
    if (updateDto.scheduleType || updateDto.scheduleConfig) {
      task.nextExecuteAt = this.calculateNextExecuteAt(task.scheduleType, task.scheduleConfig);
    }
    return await this.taskRepository.save(task);
  }

  /**
   * 删除任务
   */
  async remove(id: number): Promise<void> {
    const task = await this.findOne(id);
    await this.taskRepository.remove(task);
  }

  /**
   * 暂停任务
   */
  async pause(id: number): Promise<NotificationTask> {
    const task = await this.findOne(id);
    task.status = TaskStatus.PAUSED;
    return await this.taskRepository.save(task);
  }

  /**
   * 恢复任务
   */
  async resume(id: number): Promise<NotificationTask> {
    const task = await this.findOne(id);
    if (task.status !== TaskStatus.PAUSED) {
      throw new BadRequestException('只能恢复已暂停的任务');
    }
    task.status = TaskStatus.ACTIVE;
    task.nextExecuteAt = this.calculateNextExecuteAt(task.scheduleType, task.scheduleConfig);
    return await this.taskRepository.save(task);
  }

  /**
   * 计算下次执行时间
   */
  calculateNextExecuteAt(scheduleType: ScheduleType, scheduleConfig: Record<string, any>): Date | null {
    const now = dayjs();
    switch (scheduleType) {
      case ScheduleType.ONCE:
        return scheduleConfig.executeAt ? dayjs(scheduleConfig.executeAt).toDate() : null;
      case ScheduleType.INTERVAL:
        const startAt = dayjs(scheduleConfig.startAt);
        const intervalHours = scheduleConfig.intervalHours || 1;
        if (startAt.isBefore(now)) {
          const hoursSinceStart = now.diff(startAt, 'hour');
          const intervalsPassed = Math.floor(hoursSinceStart / intervalHours);
          return startAt.add((intervalsPassed + 1) * intervalHours, 'hour').toDate();
        }
        return startAt.toDate();
      case ScheduleType.DAILY:
        const dailyTime = scheduleConfig.time || '09:00';
        const [dailyHour, dailyMinute] = dailyTime.split(':').map(Number);
        let dailyDate = now.hour(dailyHour).minute(dailyMinute).second(0).millisecond(0);
        if (dailyDate.isBefore(now)) {
          dailyDate = dailyDate.add(1, 'day');
        }
        return dailyDate.toDate();
      case ScheduleType.WEEKLY:
        const weeklyDayOfWeek = scheduleConfig.dayOfWeek ?? 0;
        const weeklyTime = scheduleConfig.time || '09:00';
        const [weeklyHour, weeklyMinute] = weeklyTime.split(':').map(Number);
        let weeklyDate = now.day(weeklyDayOfWeek).hour(weeklyHour).minute(weeklyMinute).second(0).millisecond(0);
        if (weeklyDate.isBefore(now)) {
          weeklyDate = weeklyDate.add(1, 'week');
        }
        return weeklyDate.toDate();
      case ScheduleType.MONTHLY:
        const monthlyDayOfMonth = scheduleConfig.dayOfMonth ?? 1;
        const monthlyTime = scheduleConfig.time || '09:00';
        const [monthlyHour, monthlyMinute] = monthlyTime.split(':').map(Number);
        let monthlyDate = now.date(monthlyDayOfMonth).hour(monthlyHour).minute(monthlyMinute).second(0).millisecond(0);
        if (monthlyDate.isBefore(now)) {
          monthlyDate = monthlyDate.add(1, 'month');
        }
        const daysInMonth = monthlyDate.daysInMonth();
        if (monthlyDayOfMonth > daysInMonth) {
          monthlyDate = monthlyDate.date(daysInMonth);
        }
        return monthlyDate.toDate();
      default:
        return null;
    }
  }

  /**
   * 获取需要执行的任务列表
   */
  async findTasksToExecute(): Promise<NotificationTask[]> {
    const now = new Date();
    return await this.taskRepository.find({
      where: {
        status: TaskStatus.ACTIVE,
      },
      relations: ['user'],
    });
  }

  /**
   * 更新任务执行信息
   */
  async updateTaskExecution(task: NotificationTask, success: boolean): Promise<void> {
    task.lastExecuteAt = new Date();
    task.executeCount += 1;
    if (task.scheduleType === ScheduleType.ONCE) {
      task.status = TaskStatus.COMPLETED;
      task.nextExecuteAt = null;
    } else {
      task.nextExecuteAt = this.calculateNextExecuteAt(task.scheduleType, task.scheduleConfig);
      if (task.maxExecuteCount && task.executeCount >= task.maxExecuteCount) {
        task.status = TaskStatus.COMPLETED;
        task.nextExecuteAt = null;
      }
    }
    if (!success) {
      task.status = TaskStatus.FAILED;
    }
    await this.taskRepository.save(task);
  }
}

