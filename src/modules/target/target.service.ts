import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Target } from './entities/target.entity';
import { Task } from './entities/task.entity';
import { CreateTargetDto } from './dto/create-target.dto';

@Injectable()
export class TargetService {
  constructor(
    @InjectRepository(Target)
    private targetRepository: Repository<Target>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  async create(createTargetDto: CreateTargetDto): Promise<Target> {
    const target = this.targetRepository.create(createTargetDto);
    return await this.targetRepository.save(target);
  }

  async findAll(): Promise<Target[]> {
    return await this.targetRepository.find({
      relations: ['tasks'],
    });
  }

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

  async updateProgress(targetId: number): Promise<void> {
    const target = await this.findOne(targetId);
    const tasks = await this.taskRepository.find({
      where: { target: { id: targetId } },
    });

    const totalTaskTime = tasks.reduce((sum, task) => sum + task.time, 0);
    const progress = totalTaskTime;
    const completionPercentage = (totalTaskTime / target.plannedHours) * 100;

    await this.targetRepository.update(targetId, {
      progress,
      completionPercentage: Math.min(completionPercentage, 100),
    });
  }
} 