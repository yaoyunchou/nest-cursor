import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { User } from './entities/user.entity';
import { Target } from '../target/entities/target.entity';
import { Task } from '../target/entities/task.entity';
import { ReadingCheckin } from '../reading/entities/reading-checkin.entity';

/**
 * 用户汇总服务
 * 整合各个模块的汇总数据
 */
@Injectable()
export class UserSummaryService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Target)
    private readonly targetRepository: Repository<Target>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(ReadingCheckin)
    private readonly readingCheckinRepository: Repository<ReadingCheckin>,
  ) {}

  /**
   * 获取用户首页汇总数据
   * @param userId 用户ID（可选，未登录时为undefined）
   * @returns 用户首页汇总数据
   */
  async getUserSummary(userId?: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    monthStart.setHours(0, 0, 0, 0);

    if (!userId) {
      return {
        isAuth: false,
        goals: {
          statistics: {
            total: 0,
            completed: 0,
            inProgress: 0,
            completion_rate: 0,
          },
          list: [],
        },
        tasks: {
          todayCount: 0,
        },
        reading: {
          todayCheckIns: 0,
        },
        errorbook: {
          total: 0,
          today: 0,
        },
        focus: {
          today: 0,
          month: 0,
          total: 0,
        },
        habits: {
          inProgress: 0,
        },
        period: {
          status: '',
          nextDays: 0,
        },
      };
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return {
        isAuth: false,
        goals: {
          statistics: {
            total: 0,
            completed: 0,
            inProgress: 0,
            completion_rate: 0,
          },
          list: [],
        },
        tasks: {
          todayCount: 0,
        },
        reading: {
          todayCheckIns: 0,
        },
        errorbook: {
          total: 0,
          today: 0,
        },
        focus: {
          today: 0,
          month: 0,
          total: 0,
        },
        habits: {
          inProgress: 0,
        },
        period: {
          status: '',
          nextDays: 0,
        },
      };
    }

    const [goals, tasks, readingCheckins] = await Promise.all([
      this.getGoalsSummary(userId),
      this.getTasksSummary(userId, today, tomorrow),
      this.getReadingSummary(userId, today, tomorrow),
    ]);

    return {
      isAuth: true,
      user: {
        username: user.username,
        avatar: user.avatar || '',
      },
      goals,
      tasks,
      reading: readingCheckins,
      errorbook: {
        total: 0,
        today: 0,
      },
      focus: {
        today: 0,
        month: 0,
        total: 0,
      },
      habits: {
        inProgress: 0,
      },
      period: {
        status: '',
        nextDays: 0,
      },
    };
  }

  /**
   * 获取目标模块汇总数据
   */
  private async getGoalsSummary(userId: number) {
    const targets = await this.targetRepository.find({
      where: { user: { id: userId } },
      relations: ['tasks'],
      order: { createdAt: 'DESC' },
    });

    const total = targets.length;
    const completed = targets.filter((t) => t.status === 'COMPLETED').length;
    const inProgress = targets.filter((t) => t.status === 'IN_PROGRESS').length;
    const completion_rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    const list = targets.slice(0, 5).map((target) => ({
      id: target.id,
      name: target.name,
      status: target.status,
      plannedHours: target.plannedHours,
      progress: target.progress,
      completionPercentage: target.completionPercentage,
      createdAt: target.createdAt,
    }));

    return {
      statistics: {
        total,
        completed,
        inProgress,
        completion_rate,
      },
      list,
    };
  }

  /**
   * 获取任务模块汇总数据
   */
  private async getTasksSummary(userId: number, today: Date, tomorrow: Date) {
    const todayTasks = await this.taskRepository.count({
      where: {
        userId,
        createdAt: Between(today, tomorrow),
      },
    });

    return {
      todayCount: todayTasks,
    };
  }

  /**
   * 获取读书打卡模块汇总数据
   */
  private async getReadingSummary(userId: number, today: Date, tomorrow: Date) {
    const todayCheckIns = await this.readingCheckinRepository
      .createQueryBuilder('checkin')
      .where('checkin.user_id = :userId', { userId })
      .andWhere('DATE(checkin.checkInDate) = DATE(:today)', { today })
      .getCount();

    return {
      todayCheckIns,
    };
  }
}

