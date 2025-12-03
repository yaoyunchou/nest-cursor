import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Between } from 'typeorm';
import { ReadingCheckin } from './entities/reading-checkin.entity';
import { ReadingTask } from './entities/reading-task.entity';
import { CreateReadingCheckinDto } from './dto/create-reading-checkin.dto';
import { UpdateReadingCheckinDto } from './dto/update-reading-checkin.dto';
import { QueryReadingCheckinDto } from './dto/query-reading-checkin.dto';
import { ReadingTaskService } from './reading-task.service';
import { FileService } from '../file/file.service';

/**
 * 打卡记录服务
 * 负责处理打卡记录的业务逻辑
 */
@Injectable()
export class ReadingCheckinService {
  private readonly logger = new Logger(ReadingCheckinService.name);
  constructor(
    @InjectRepository(ReadingCheckin)
    private readonly readingCheckinRepository: Repository<ReadingCheckin>,
    @InjectRepository(ReadingTask)
    private readonly readingTaskRepository: Repository<ReadingTask>,
    private readonly readingTaskService: ReadingTaskService,
    private readonly fileService: FileService,
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
      throw new NotFoundException(`对应用户${userId}的任务ID ${taskId} 未找到`);
    }
    const checkInDate = new Date(createReadingCheckinDto.checkInDate);
    checkInDate.setHours(0, 0, 0, 0);
    const taskStartDate = new Date(task.startDate);
    taskStartDate.setHours(0, 0, 0, 0);
    const taskEndDate = new Date(task.endDate);
    taskEndDate.setHours(0, 0, 0, 0);
    if (checkInDate < taskStartDate || checkInDate > taskEndDate) {
      throw new BadRequestException('打卡日期不在任务日期范围内');
    }
    // 确定初始audioUrl：优先使用audioUrl，否则使用audioUrlList的第一个
    let initialAudioUrl = createReadingCheckinDto.audioUrl;
    if (!initialAudioUrl && createReadingCheckinDto.audioUrlList && createReadingCheckinDto.audioUrlList.length > 0) {
      initialAudioUrl = createReadingCheckinDto.audioUrlList[0];
    }
    // 创建打卡记录（先保存，不等待合并）
    const checkin = this.readingCheckinRepository.create({
      task: { id: taskId } as any,
      user: { id: userId } as any,
      checkInDate,
      audioUrl: initialAudioUrl,
      audioUrlList: createReadingCheckinDto.audioUrlList,
      duration: createReadingCheckinDto.duration,
    });
    const savedCheckin = await this.readingCheckinRepository.save(checkin);
    // 如果有多个音频文件需要合并，异步执行合并任务
    if (createReadingCheckinDto.audioUrlList && createReadingCheckinDto.audioUrlList.length > 1) {
      this.mergeAudioAsync(savedCheckin.id, createReadingCheckinDto.audioUrlList, userId).catch((error) => {
        this.logger.error(`打卡记录 ${savedCheckin.id} 音频合并失败:`, error);
      });
    }
    await this.readingTaskService.updateCompletedCheckIns(taskId);
    return savedCheckin;
  }

  /**
   * 获取打卡记录列表
   * @param query 查询参数
   * @param userId 用户ID
   * @param isAdmin 是否为管理员，管理员可以查看所有数据
   * @returns 打卡记录列表
   */
  async findAll(query: QueryReadingCheckinDto, userId: number, isAdmin: boolean = false): Promise<ReadingCheckin[]> {
    const { taskId, year, month, page = 1, pageSize = 10 } = query;
    const where: FindOptionsWhere<ReadingCheckin> = {};
    if (!isAdmin) {
      where.user = { id: userId };
    }
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
   * @param isAdmin 是否为管理员，管理员可以查看所有数据
   * @returns 打卡记录详情
   */
  async findOne(id: number, userId: number, isAdmin: boolean = false): Promise<ReadingCheckin> {
    const where: FindOptionsWhere<ReadingCheckin> = { id };
    if (!isAdmin) {
      where.user = { id: userId };
    }
    const checkin = await this.readingCheckinRepository.findOne({
      where,
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
    if (updateReadingCheckinDto.audioUrlList !== undefined) {
      checkin.audioUrlList = updateReadingCheckinDto.audioUrlList;
      if (updateReadingCheckinDto.audioUrlList.length > 0) {
        if (updateReadingCheckinDto.audioUrlList.length === 1) {
          checkin.audioUrl = updateReadingCheckinDto.audioUrlList[0];
        } else {
          // 多个文件时，先使用第一个URL，然后异步合并
          checkin.audioUrl = updateReadingCheckinDto.audioUrlList[0];
          const savedCheckin = await this.readingCheckinRepository.save(checkin);
          // 异步执行合并任务
          this.mergeAudioAsync(savedCheckin.id, updateReadingCheckinDto.audioUrlList, userId).catch((error) => {
            this.logger.error(`打卡记录 ${savedCheckin.id} 音频合并失败:`, error);
          });
          return savedCheckin;
        }
      }
    }
    if (updateReadingCheckinDto.duration !== undefined) {
      checkin.duration = updateReadingCheckinDto.duration;
    }
    return await this.readingCheckinRepository.save(checkin);
  }

  /**
   * 异步合并音频文件并更新打卡记录
   * @param checkinId 打卡记录ID
   * @param audioUrlList 音频URL列表
   * @param userId 用户ID
   */
  private async mergeAudioAsync(checkinId: number, audioUrlList: string[], userId: number): Promise<void> {
    const maxRetries = 3; // 最多重试3次
    const retryInterval = 5 * 60 * 1000; // 5分钟（毫秒）
    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.logger.log(`打卡记录 ${checkinId} 开始第 ${attempt} 次音频合并尝试`);
        const mergedFile = await this.fileService.mergeAudioByUrls(audioUrlList, userId, 'reading/merge');
        await this.readingCheckinRepository.update(checkinId, {
          audioUrl: mergedFile.url,
        });
        this.logger.log(`打卡记录 ${checkinId} 音频合并完成（第 ${attempt} 次尝试），已更新audioUrl`);
        return; // 成功则退出
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        this.logger.warn(`打卡记录 ${checkinId} 第 ${attempt} 次音频合并失败:`, lastError.message);
        // 如果不是最后一次尝试，等待后重试
        if (attempt < maxRetries) {
          this.logger.log(`打卡记录 ${checkinId} 将在 ${retryInterval / 1000 / 60} 分钟后进行第 ${attempt + 1} 次重试`);
          await new Promise((resolve) => setTimeout(resolve, retryInterval));
        }
      }
    }
    // 所有重试都失败，记录错误但不抛出异常（避免影响主流程）
    this.logger.error(`打卡记录 ${checkinId} 音频合并失败，已重试 ${maxRetries} 次:`, lastError);
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

