import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Between } from 'typeorm';
import { ReadingCheckin } from './entities/reading-checkin.entity';
import { ReadingTask } from './entities/reading-task.entity';
import { CreateReadingCheckinDto } from './dto/create-reading-checkin.dto';
import { UpdateReadingCheckinDto } from './dto/update-reading-checkin.dto';
import { QueryReadingCheckinDto } from './dto/query-reading-checkin.dto';
import { ReadingTaskService } from './reading-task.service';

/**
 * 打卡记录服务
 * 负责处理打卡记录的业务逻辑
 */
@Injectable()
export class ReadingCheckinService {
  constructor(
    @InjectRepository(ReadingCheckin)
    private readonly readingCheckinRepository: Repository<ReadingCheckin>,
    @InjectRepository(ReadingTask)
    private readonly readingTaskRepository: Repository<ReadingTask>,
    private readonly readingTaskService: ReadingTaskService,
  ) {}

  /**
   * 创建打卡记录
   * @param createReadingCheckinDto 创建打卡记录DTO
   * @param userId 用户ID
   * @returns 创建的打卡记录
   */
  async create(createReadingCheckinDto: CreateReadingCheckinDto, userId: number): Promise<ReadingCheckin> {
    const taskId = createReadingCheckinDto.taskId;
    const task = await this.readingTaskRepository.findOne({
      where: { id: taskId, user: { id: userId } },
    });
    if (!task) {
      throw new NotFoundException(`任务ID ${taskId} 未找到`);
    }
    const checkInDate = new Date(createReadingCheckinDto.checkInDate);
    const taskStartDate = new Date(task.startDate);
    const taskEndDate = new Date(task.endDate);
    if (checkInDate < taskStartDate || checkInDate > taskEndDate) {
      throw new BadRequestException('打卡日期不在任务日期范围内');
    }
    const existingCheckin = await this.readingCheckinRepository.findOne({
      where: {
        task: { id: taskId },
        checkInDate,
      },
    });
    if (existingCheckin) {
      throw new BadRequestException('该日期已打卡');
    }
    const checkin = this.readingCheckinRepository.create({
      task: { id: taskId } as any,
      user: { id: userId } as any,
      checkInDate,
      audioUrl: createReadingCheckinDto.audioUrl,
      duration: createReadingCheckinDto.duration,
    });
    const savedCheckin = await this.readingCheckinRepository.save(checkin);
    await this.readingTaskService.updateCompletedCheckIns(taskId);
    return savedCheckin;
  }

  /**
   * 获取打卡记录列表
   * @param query 查询参数
   * @param userId 用户ID
   * @returns 打卡记录列表
   */
  async findAll(query: QueryReadingCheckinDto, userId: number): Promise<ReadingCheckin[]> {
    const { taskId, year, month, page = 1, pageSize = 10 } = query;
    const where: FindOptionsWhere<ReadingCheckin> = {
      user: { id: userId },
    };
    if (taskId) {
      where.task = { id: taskId } as any;
    }
    if (year && month) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      where.checkInDate = Between(startDate, endDate) as any;
    } else if (year) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31);
      where.checkInDate = Between(startDate, endDate) as any;
    }
    const [list] = await this.readingCheckinRepository.findAndCount({
      where,
      relations: ['task'],
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: {
        checkInDate: 'DESC',
      },
    });
    return list;
  }

  /**
   * 获取打卡记录详情
   * @param id 打卡记录ID
   * @param userId 用户ID
   * @returns 打卡记录详情
   */
  async findOne(id: number, userId: number): Promise<ReadingCheckin> {
    const checkin = await this.readingCheckinRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['task'],
    });
    if (!checkin) {
      throw new NotFoundException(`打卡记录ID ${id} 未找到`);
    }
    return checkin;
  }

  /**
   * 更新打卡记录
   * @param id 打卡记录ID
   * @param updateReadingCheckinDto 更新打卡记录DTO
   * @param userId 用户ID
   * @returns 更新后的打卡记录
   */
  async update(id: number, updateReadingCheckinDto: UpdateReadingCheckinDto, userId: number): Promise<ReadingCheckin> {
    const checkin = await this.findOne(id, userId);
    if (updateReadingCheckinDto.audioUrl !== undefined) {
      checkin.audioUrl = updateReadingCheckinDto.audioUrl;
    }
    if (updateReadingCheckinDto.duration !== undefined) {
      checkin.duration = updateReadingCheckinDto.duration;
    }
    return await this.readingCheckinRepository.save(checkin);
  }

  /**
   * 删除打卡记录
   * @param id 打卡记录ID
   * @param userId 用户ID
   */
  async remove(id: number, userId: number): Promise<void> {
    const checkin = await this.findOne(id, userId);
    const taskId = checkin.task.id;
    await this.readingCheckinRepository.remove(checkin);
    await this.readingTaskService.updateCompletedCheckIns(taskId);
  }
}

