import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Like, Repository } from 'typeorm';
import { Target } from './entities/target.entity';
import { Task } from './entities/task.entity';
import { CreateTargetDto } from './dto/create-target.dto';
import { CreateTargetTaskDto } from './dto/create-target-task.dot';
import { UpdateTargetTaskDto } from './dto/update-target-task.dot';
import { User } from '../user/entities/user.entity';
import { ErrorBook } from '../errorbook/entities/errorbook.entity';

@Injectable()
export class TargetService {
  constructor(
    @InjectRepository(Target)
    private targetRepository: Repository<Target>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(ErrorBook)
    private errorBookRepository: Repository<ErrorBook>,
  ) {}

  /**
   * 创建新目标
   * @param createTargetDto - 目标创建数据传输对象
   * @param userId - 用户ID（可选，用于创建用户目标关联）
   * @returns 创建的目标实体
   */
  async create(createTargetDto: CreateTargetDto, userId?: number): Promise<Target> {
    const target = this.targetRepository.create(createTargetDto);
    if (userId) {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (user) {
        target.user = user;
      }
    }
    return await this.targetRepository.save(target);
  }

  /**
   * 获取所有目标列表
   * @returns 目标列表，包含关联的任务
   */
  async findAll(query: {pageSize?: number, pageIndex?: number, name?: string, status?: string}, userId?: number): Promise<{list: Target[], total: number, pageSize: number, pageIndex: number}> {
    /**
     * 列表需要返回total, pagesize, pageIndex, 参数可能会传入pageSize, pageIndex
     * 1. 如果传入pageSize, pageIndex,则使用传入的， 没有则默认pageSize:10, pageIndex:1
     * 2. 会根据name 进行模糊查询
     * 3. 会根据status 进行查询
     * 
     *  */ 

    const {pageSize = 10, pageIndex = 1, name, status} = query; 
    const where: FindOptionsWhere<Target> = {};
    if (name) {
      where.name = Like(`%${name}%`);
    }
    if (status) {
      where.status = status;
    }
    if (userId) {
      where.user = { id: userId };
    }

    const [targets, total] = await this.targetRepository.findAndCount({
      where,
      relations: ['tasks'],
      skip: (pageIndex - 1) * pageSize,
      take: pageSize,
    });
    return {
      list:targets,
      total,
      pageSize: 10,
      pageIndex: 1,
    };
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
   * 更新目标
   * @param id - 目标ID
   * @param updateTargetDto - 更新目标数据
   * @returns 更新后的目标实体
   */
  async update(id: number, updateTargetDto: CreateTargetDto): Promise<void> {
    const target = await this.findOne(id);
    if (!target) {
      throw new NotFoundException(`目标ID ${id} 未找到`);
    }
    Object.assign(target, updateTargetDto);
    await this.targetRepository.save(target);
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
   * 返回删除结果
   * @param id - 目标ID
   */
  async delete(id: number): Promise<{message: string}> { 
    try {
      await this.targetRepository.delete(id);
      await this.taskRepository.delete({ target: { id } });
      return {
        message: '删除成功',
      };
    } catch (error) {
      return {
        message: '删除失败',
      };
    }

  }

  /**
   * 创建任务 
   * @param targetId - 目标ID
   * @param createTargetTaskDto - 任务创建数据
   * @param userId - 用户ID
   * @returns 创建的任务实体
   */
  async createTask(targetId: number, createTargetTaskDto: CreateTargetTaskDto, userId: number): Promise<Task> {
    try {
      const target = await this.findOne(targetId);
      if(!target) {
        throw new NotFoundException('目标不存在');
      }
      /**
     /**
      * 获取目标对应的所有任务
      * 计算当前目标的进度， 总时间， 剩余时间
      */
    const targetTasks = await this.taskRepository.find({ where: { target: { id: targetId } } });
    const totalTaskTime = targetTasks.reduce((sum, task) => sum + task.time, 0);
    const progress = totalTaskTime;
    const completionPercentage = (totalTaskTime / target.plannedHours) * 100;
    target.progress = progress;
    target.completionPercentage = completionPercentage;
    const task = this.taskRepository.create({ ...createTargetTaskDto, userId, target });
    return await this.taskRepository.save(task);
  } catch (error) {
    throw new BadRequestException('创建任务失败');
  }
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
  async updateTask(targetId: number, taskId: number, updateTaskDto: UpdateTargetTaskDto): Promise<Task> {
    const task = await this.findOneTask(targetId, taskId);
    return await this.taskRepository.save({ ...task, ...updateTaskDto });
  }

  /**
   * 获取指定任务列表
   * @param query - 查询参数, 包含pageSize, pageIndex, name, targetId
   * @returns 任务列表
   */
  async findAllTasks(query: {pageSize?: number, userId?: number, pageIndex?: number, name?: string, status?: string, targetId?: number}):
   Promise<{list: Task[], total: number, pageSize: number, pageIndex: number}> {
    const {pageSize = 10, pageIndex = 1, userId, name, targetId} = query;
    const where: FindOptionsWhere<Task> = {};
    if (name) {
      where.name = Like(`%${name}%`);
    }
    if (userId) {
      where.userId = userId;
    }
    if (targetId) {
      where.target = { id: targetId };
    }
    if (userId) {
      where.userId = userId;
    }
    /**
     * 返回任务列表
     * list: 任务列表
     * total: 任务总数
     * pageSize: 每页大小
     * pageIndex: 当前页码
     * targetId: 目标ID
     */
    const [tasks, total] = await this.taskRepository.findAndCount({     
      relations: ['target'],
      where,
      skip: (pageIndex - 1) * pageSize,
      take: pageSize,
    });
    return {
      list: tasks,
      total,
      pageSize,
      pageIndex,
    };
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


  /**
   * 用户目标汇总
   *  1. 获取用户的所有目标， 计算总时间， 完成时间， 完成百分比
   *  2. 获取用户的所有任务， 计算总时间， 完成时间， 完成百分比
   *  3. 返回用户目标汇总
   * @param userId - 用户ID
   * @returns 用户目标汇总对象，包含以下字段：
   *   - targets: 目标列表数组，每个目标包含：
   *     - id: 目标ID
   *     - name: 目标名称
   *     - description: 目标描述
   *     - status: 目标状态（PENDING/IN_PROGRESS/COMPLETED/CANCELLED）
   *     - plannedHours: 计划完成时间（小时）
   *     - progress: 当前已完成时间（小时）
   *     - completionPercentage: 完成百分比（0-100）
   *     - startTime: 目标开始时间
   *     - endTime: 目标结束时间
   *     - completedTime: 已完成时间（小时，根据任务累计）
   *     - createdAt: 创建时间
   *     - updatedAt: 更新时间
   *     - tasks: 任务列表数组
   *   - user: 当前请求用户信息对象（最外层），包含：
   *     - id: 用户ID
   *     - username: 用户名
   *     - email: 邮箱
   *     - avatar: 头像URL
   *     - gender: 性别
   *     - phone: 手机号
   *     - birth: 生日
   *     - address: 地址（数组）
   *     - addressText: 地址文本
   *     - status: 用户状态
   *     - remark: 备注
   *     - createdAt: 创建时间
   *     - updatedAt: 更新时间
   *   - totalTargets: 总目标数
   *   - totalTasks: 总任务数
   *   - totalPlannedTime: 总目标规划时间（小时）
   *   - totalTaskCompletedTime: 总任务完成时间（小时）
   *   - totalTime: 总时间（小时，等于totalPlannedTime）
   *   - totalTaskTime: 总任务时间（小时，等于totalTaskCompletedTime）
   *   - completedTargetsPercentage: 完成目标百分比（0-100）
   *   - completionPercentage: 完成任务百分比（0-100，基于时间）
   *   - completedTargets: 已完成的目标数组
   *   - todayCompletedTasksCount: 今天完成的任务个数
   *   - errorbook: 错题本统计信息，包含：
   *     - total: 总错题数
   *     - today: 今日新增错题数
   */
  async summary (userId: number): Promise<any> {
    // 查询当前请求用户信息
    const currentUser = await this.userRepository.findOne({ where: { id: userId } });
    if (!currentUser) {
      throw new NotFoundException('用户不存在');
    }
    // 构建当前用户信息对象（排除敏感信息如密码）
    const userInfo = {
      id: currentUser.id, // 用户ID
      username: currentUser.username, // 用户名
      email: currentUser.email, // 邮箱
      avatar: currentUser.avatar, // 头像URL
      gender: currentUser.gender, // 性别
      phone: currentUser.phone, // 手机号
      birth: currentUser.birth, // 生日
      address: currentUser.address, // 地址（数组）
      addressText: currentUser.addressText, // 地址文本
      status: currentUser.status, // 用户状态
      remark: currentUser.remark, // 备注
      createdAt: currentUser.createdAt, // 创建时间
      updatedAt: currentUser.updatedAt, // 更新时间
    };
    // 查询用户的所有目标（不需要加载user关联，因为我们已经查询了当前用户）
    const targets = await this.targetRepository.find({ 
      where: { user: { id: userId } },
      relations: ['tasks']
    });
    // 总目标数：用户创建的所有目标数量
    const totalTargets = targets.length;
    // 总任务数：所有目标下的任务总数
    const totalTasks = targets.reduce((sum, target) => sum + (target.tasks?.length || 0), 0);
    // 总目标规划时间（小时）：所有目标的计划完成时间总和
    const totalPlannedTime = targets.reduce((sum, target) => sum + (target.plannedHours || 0), 0);
    // 总任务完成时间（小时）：所有任务的实际完成时间总和
    const totalTaskCompletedTime = targets.reduce((sum, target) => sum + (target.tasks?.reduce((sum, task) => sum + (task.time || 0), 0) || 0), 0);
    // 总时间（小时）：所有目标的计划完成时间总和（与totalPlannedTime相同）
    const totalTime = targets.reduce((sum, target) => sum + (target.plannedHours || 0), 0);
    // 总任务时间（小时）：所有任务的实际完成时间总和（与totalTaskCompletedTime相同）
    const totalTaskTime = targets.reduce((sum, target) => sum + (target.tasks?.reduce((sum, task) => sum + (task.time || 0), 0) || 0), 0);
    // 已完成的目标列表：状态为COMPLETED的目标
    const completedTargets = targets.filter(target => target.status === 'COMPLETED');
    // 完成目标百分比（0-100）：已完成目标数 / 总目标数 * 100，避免除以0
    const completedTargetsPercentage = totalTargets > 0 
      ? (completedTargets.length / totalTargets) * 100 
      : 0;
    // 完成任务百分比（0-100）：总任务时间 / 总计划时间 * 100，避免除以0
    const completionPercentage = totalTime > 0 
      ? (totalTaskTime / totalTime) * 100 
      : 0;
    // 今天完成的任务个数：统计今天创建的任务数量
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 设置为今天的00:00:00
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1); // 明天的00:00:00
    let todayCompletedTasksCount = 0;
    for (const target of targets) {
      if (target.tasks && target.tasks.length > 0) {
        todayCompletedTasksCount += target.tasks.filter(task => {
          const taskDate = new Date(task.createdAt);
          return taskDate >= today && taskDate < tomorrow;
        }).length;
      }
    }
    // 错题本统计：查询用户的总错题数和今日新增错题数
    const [errorBookTotal, errorBookToday] = await Promise.all([
      this.errorBookRepository.count({
        where: { user: { id: userId } },
      }),
      this.errorBookRepository
        .createQueryBuilder('errorbook')
        .where('errorbook.user_id = :userId', { userId })
        .andWhere('DATE(errorbook.createdAt) = DATE(:today)', { today })
        .getCount(),
    ]);
    // 构建目标汇总列表：为每个目标计算完成时间和完成百分比
    const targetSummaryList = [];
    for(let i = 0; i < targets.length; i++) {
      const target = targets[i];
      // 已完成时间（小时）：该目标下所有任务的时间总和
      const completedTime = target.tasks?.reduce((sum, task) => sum + (task.time || 0), 0) || 0;
      // 计划完成时间（小时）
      const plannedHours = target.plannedHours || 0;
      // 构建目标汇总项（不包含用户信息，用户信息在最外层）
      const targetSummaryItem = {
        id: target.id, // 目标ID
        name: target.name, // 目标名称
        description: target.description, // 目标描述
        status: target.status, // 目标状态（PENDING/IN_PROGRESS/COMPLETED/CANCELLED）
        plannedHours: plannedHours, // 计划完成时间（小时）
        progress: target.progress, // 当前已完成时间（小时）
        completionPercentage: plannedHours > 0 
          ? (completedTime / plannedHours) * 100 
          : 0, // 完成百分比（0-100）：已完成时间 / 计划时间 * 100
        startTime: target.startTime, // 目标开始时间
        endTime: target.endTime, // 目标结束时间
        completedTime: completedTime, // 已完成时间（小时，根据任务累计）
        createdAt: target.createdAt, // 创建时间
        updatedAt: target.updatedAt, // 更新时间
        tasks: target.tasks || [], // 任务列表数组
      };
      targetSummaryList.push(targetSummaryItem);
    }
    // 返回用户目标汇总对象
    return {
      user: userInfo, // 当前请求用户信息对象（最外层）
      targets: targetSummaryList, // 目标列表数组
      totalTargets, // 总目标数
      totalTasks, // 总任务数
      totalPlannedTime, // 总目标规划时间（小时）
      totalTaskCompletedTime, // 总任务完成时间（小时）
      totalTime, // 总时间（小时，等于totalPlannedTime）
      totalTaskTime, // 总任务时间（小时，等于totalTaskCompletedTime）
      completedTargetsPercentage, // 完成目标百分比（0-100）
      completionPercentage, // 完成任务百分比（0-100，基于时间）
      completedTargets, // 已完成的目标数组
      todayCompletedTasksCount, // 今天完成的任务个数
      errorbook: { // 错题本统计信息
        total: errorBookTotal, // 总错题数
        today: errorBookToday, // 今日新增错题数
      },
    };
  }
  
  /**
   * 创建公共任务
   * @param createTargetTaskDto - 任务创建数据
   * @returns 创建的任务实体
   */
  async createPublicTask(createTargetTaskDto: CreateTargetTaskDto): Promise<Task> {
    try {
      const task = this.taskRepository.create({ ...createTargetTaskDto, target: { id: 1 } });
      return await this.taskRepository.save(task);
    } catch (error) {
      throw new BadRequestException('创建公共任务失败');
    }
  }
} 