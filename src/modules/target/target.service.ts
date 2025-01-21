import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Target } from './entities/target.entity';
import { Task } from './entities/task.entity';
import { CreateTargetDto } from './dto/create-target.dto';
import { CreateTargetTaskDto } from './dto/create-target-task.dot';
import { UpdateTargetTaskDto } from './dto/update-target-task.dot';

@Injectable()
export class TargetService {
  constructor(
    @InjectRepository(Target)
    private targetRepository: Repository<Target>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  /**
   * 创建新目标
   * @param createTargetDto - 目标创建数据传输对象
   * @returns 创建的目标实体
   */
  async create(createTargetDto: CreateTargetDto): Promise<Target> {
    const target = this.targetRepository.create(createTargetDto);
    return await this.targetRepository.save(target);
  }

  /**
   * 获取所有目标列表
   * @returns 目标列表，包含关联的任务
   */
  async findAll(): Promise<Target[]> {
    return await this.targetRepository.find({
      relations: ['tasks'],
    });
  }

  /**
   * 获取指定ID的目标
   * @param id - 目标ID
   * @returns 目标实体，包含关联的任务
   * @throws NotFoundException 当目标不存在时抛出异常
   */
  async findOne(id: number): Promise<Target> {
    const target = await this.targetRepository.findOne({
      where: { id },
      relations: ['tasks'],
    });
    if (!target) {
      throw new NotFoundException(`目标ID ${id} 未找到`);
    }
    return target;
  }

  /**
   * 更新目标进度
   * 根据关联任务的总时间计算目标的完成进度和百分比
   * @param targetId - 目标ID
   */
  async updateProgress(targetId: number): Promise<void> {
    const target = await this.findOne(targetId);
    const tasks = await this.taskRepository.find({
      where: { target: { id: targetId } },
    });

    // 计算所有任务的总时间
    const totalTaskTime = tasks.reduce((sum, task) => sum + task.time, 0);
    const progress = totalTaskTime;
    // 计算完成百分比，不超过100%
    const completionPercentage = (totalTaskTime / target.plannedHours) * 100;

    await this.targetRepository.update(targetId, {
      progress,
      completionPercentage: Math.min(completionPercentage, 100),
    });
  }

  /**
   * 删除目标
   * @param id - 目标ID
   */
  async delete(id: number): Promise<void> {
    await this.targetRepository.delete(id);
  }

  /**
   * 创建任务 
   * @param targetId - 目标ID
   * @param createTaskDto - 任务创建数据
   * @returns 创建的任务实体
   */
  async createTask(targetId: number, createTargetTaskDto: CreateTargetTaskDto): Promise<Task> {
    const target = await this.findOne(targetId);
    const task = this.taskRepository.create({ ...createTargetTaskDto, target });
    return await this.taskRepository.save(task);
  }

  /**
   * 删除任务
   * @param targetId - 目标ID
   * @param taskId - 任务ID
   */
  async deleteTask(targetId: number, taskId: number): Promise<void> {
    await this.taskRepository.delete(taskId);
  }

  /**
   * 更新任务
   * @param targetId - 目标ID
   * @param taskId - 任务ID
   * @param updateTaskDto - 任务更新数据
   * @returns 更新的任务实体
   */
  async updateTask(targetId: number, taskId: number, updateTargetTaskDto: UpdateTargetTaskDto): Promise<Task> {
    const task = await this.findOneTask(targetId, taskId);
    return await this.taskRepository.save({ ...task, ...updateTargetTaskDto });
  }

  /**
   * 获取指定目标下的所有任务
   * @param targetId - 目标ID
   * @returns 任务列表
   */
  async findAllTasks(targetId: number): Promise<Task[]> {
    return await this.taskRepository.find({ where: { target: { id: targetId } } });
  }

  /**
   * 获取指定目标下的指定任务
   * @param targetId - 目标ID
   * @param taskId - 任务ID
   * @returns 任务实体
   */
  async findOneTask(targetId: number, taskId: number): Promise<Task> {
    return await this.taskRepository.findOne({ where: { id: taskId, target: { id: targetId } } });
  }
} 