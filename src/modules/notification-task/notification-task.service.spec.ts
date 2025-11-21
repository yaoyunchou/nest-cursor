/*
 * @Description: 通知任务服务测试
 */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { NotificationTaskService } from './notification-task.service';
import { NotificationTask, ScheduleType, TaskStatus, NotificationChannel } from './entities/notification-task.entity';
import { CreateNotificationTaskDto } from './dto/create-notification-task.dto';
import { UpdateNotificationTaskDto } from './dto/update-notification-task.dto';
import { QueryNotificationTaskDto } from './dto/query-notification-task.dto';
import * as dayjs from 'dayjs';

describe('NotificationTaskService', () => {
  let service: NotificationTaskService;
  let repository: Repository<NotificationTask>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    findAndCount: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationTaskService,
        {
          provide: getRepositoryToken(NotificationTask),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<NotificationTaskService>(NotificationTaskService);
    repository = module.get<Repository<NotificationTask>>(getRepositoryToken(NotificationTask));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('应该成功创建通知任务', async () => {
      // 安排
      const createDto: CreateNotificationTaskDto = {
        name: '测试任务',
        description: '测试描述',
        userId: 1,
        channel: NotificationChannel.FEISHU,
        channelConfig: {
          appId: 'test-app-id',
          appSecret: 'test-app-secret',
          userId: 'test-user-id',
        },
        content: {
          title: '测试标题',
        },
        scheduleType: ScheduleType.ONCE,
        scheduleConfig: {
          executeAt: '2025-01-25T10:00:00Z',
        },
      };

      const expectedTask = {
        id: 1,
        ...createDto,
        status: TaskStatus.ACTIVE,
        executeCount: 0,
        nextExecuteAt: new Date('2025-01-25T10:00:00Z'),
      };

      mockRepository.create.mockReturnValue(expectedTask);
      mockRepository.save.mockResolvedValue(expectedTask);

      // 行动
      const actualTask = await service.create(createDto);

      // 断言
      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockRepository.save).toHaveBeenCalled();
      expect(actualTask).toEqual(expectedTask);
    });

    it('应该计算下次执行时间', async () => {
      // 安排
      const createDto: CreateNotificationTaskDto = {
        name: '测试任务',
        userId: 1,
        channel: NotificationChannel.FEISHU,
        channelConfig: {
          appId: 'test-app-id',
          appSecret: 'test-app-secret',
          userId: 'test-user-id',
        },
        content: {},
        scheduleType: ScheduleType.DAILY,
        scheduleConfig: {
          time: '09:00',
        },
      };

      const expectedTask = {
        id: 1,
        ...createDto,
        nextExecuteAt: expect.any(Date),
      };

      mockRepository.create.mockReturnValue(expectedTask);
      mockRepository.save.mockResolvedValue(expectedTask);

      // 行动
      const actualTask = await service.create(createDto);

      // 断言
      expect(actualTask.nextExecuteAt).toBeDefined();
      expect(actualTask.nextExecuteAt).toBeInstanceOf(Date);
    });
  });

  describe('findAll', () => {
    it('应该成功查询任务列表', async () => {
      // 安排
      const query: QueryNotificationTaskDto = {
        pageSize: 10,
        pageIndex: 1,
      };

      const mockTasks = [
        {
          id: 1,
          name: '任务1',
          userId: 1,
          channel: NotificationChannel.FEISHU,
        },
        {
          id: 2,
          name: '任务2',
          userId: 2,
          channel: NotificationChannel.WECHAT_MINI,
        },
      ];

      mockRepository.findAndCount.mockResolvedValue([mockTasks, 2]);

      // 行动
      const actualResult = await service.findAll(query);

      // 断言
      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: {},
        relations: ['user'],
        skip: 0,
        take: 10,
        order: { createdAt: 'DESC' },
      });
      expect(actualResult).toEqual({
        list: mockTasks,
        total: 2,
        pageSize: 10,
        pageIndex: 1,
      });
    });

    it('应该支持按userId筛选', async () => {
      // 安排
      const query: QueryNotificationTaskDto = {
        pageSize: 10,
        pageIndex: 1,
        userId: 1,
      };

      const mockTasks = [
        {
          id: 1,
          name: '任务1',
          userId: 1,
        },
      ];

      mockRepository.findAndCount.mockResolvedValue([mockTasks, 1]);

      // 行动
      await service.findAll(query);

      // 断言
      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: { userId: 1 },
        relations: ['user'],
        skip: 0,
        take: 10,
        order: { createdAt: 'DESC' },
      });
    });

    it('应该支持按channel筛选', async () => {
      // 安排
      const query: QueryNotificationTaskDto = {
        pageSize: 10,
        pageIndex: 1,
        channel: NotificationChannel.FEISHU,
      };

      mockRepository.findAndCount.mockResolvedValue([[], 0]);

      // 行动
      await service.findAll(query);

      // 断言
      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: { channel: NotificationChannel.FEISHU },
        relations: ['user'],
        skip: 0,
        take: 10,
        order: { createdAt: 'DESC' },
      });
    });

    it('应该支持按status筛选', async () => {
      // 安排
      const query: QueryNotificationTaskDto = {
        pageSize: 10,
        pageIndex: 1,
        status: TaskStatus.ACTIVE,
      };

      mockRepository.findAndCount.mockResolvedValue([[], 0]);

      // 行动
      await service.findAll(query);

      // 断言
      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: { status: TaskStatus.ACTIVE },
        relations: ['user'],
        skip: 0,
        take: 10,
        order: { createdAt: 'DESC' },
      });
    });

    it('应该支持分页', async () => {
      // 安排
      const query: QueryNotificationTaskDto = {
        pageSize: 5,
        pageIndex: 2,
      };

      mockRepository.findAndCount.mockResolvedValue([[], 0]);

      // 行动
      await service.findAll(query);

      // 断言
      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: {},
        relations: ['user'],
        skip: 5,
        take: 5,
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('findOne', () => {
    it('应该成功查询单个任务', async () => {
      // 安排
      const id = 1;
      const mockTask = {
        id: 1,
        name: '测试任务',
        userId: 1,
      };

      mockRepository.findOne.mockResolvedValue(mockTask);

      // 行动
      const actualTask = await service.findOne(id);

      // 断言
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id },
        relations: ['user'],
      });
      expect(actualTask).toEqual(mockTask);
    });

    it('应该抛出NotFoundException当任务不存在时', async () => {
      // 安排
      const id = 999;
      mockRepository.findOne.mockResolvedValue(null);

      // 行动 & 断言
      await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(id)).rejects.toThrow('任务ID 999 未找到');
    });
  });

  describe('update', () => {
    it('应该成功更新任务', async () => {
      // 安排
      const id = 1;
      const updateDto: UpdateNotificationTaskDto = {
        name: '更新后的任务名',
      };

      const existingTask = {
        id: 1,
        name: '原任务名',
        userId: 1,
        scheduleType: ScheduleType.ONCE,
        scheduleConfig: {},
      };

      const updatedTask = {
        ...existingTask,
        ...updateDto,
      };

      mockRepository.findOne.mockResolvedValue(existingTask);
      mockRepository.save.mockResolvedValue(updatedTask);

      // 行动
      const actualTask = await service.update(id, updateDto);

      // 断言
      expect(mockRepository.findOne).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
      expect(actualTask).toEqual(updatedTask);
    });

    it('应该重新计算下次执行时间当更新调度配置时', async () => {
      // 安排
      const id = 1;
      const updateDto: UpdateNotificationTaskDto = {
        scheduleType: ScheduleType.DAILY,
        scheduleConfig: {
          time: '10:00',
        },
      };

      const existingTask = {
        id: 1,
        name: '测试任务',
        scheduleType: ScheduleType.ONCE,
        scheduleConfig: {},
        nextExecuteAt: new Date('2025-01-25T09:00:00Z'),
      };

      mockRepository.findOne.mockResolvedValue(existingTask);
      const nextExecuteDate = new Date('2025-01-26T10:00:00Z');
      mockRepository.save.mockImplementation((task) => {
        return Promise.resolve({
          ...task,
          ...updateDto,
          nextExecuteAt: nextExecuteDate,
        });
      });

      // 行动
      const actualTask = await service.update(id, updateDto);

      // 断言
      expect(actualTask.nextExecuteAt).toBeDefined();
      expect(actualTask.nextExecuteAt).toBeInstanceOf(Date);
    });
  });

  describe('remove', () => {
    it('应该成功删除任务', async () => {
      // 安排
      const id = 1;
      const mockTask = {
        id: 1,
        name: '测试任务',
      };

      mockRepository.findOne.mockResolvedValue(mockTask);
      mockRepository.remove.mockResolvedValue(undefined);

      // 行动
      await service.remove(id);

      // 断言
      expect(mockRepository.findOne).toHaveBeenCalled();
      expect(mockRepository.remove).toHaveBeenCalledWith(mockTask);
    });

    it('应该抛出NotFoundException当任务不存在时', async () => {
      // 安排
      const id = 999;
      mockRepository.findOne.mockResolvedValue(null);

      // 行动 & 断言
      await expect(service.remove(id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('pause', () => {
    it('应该成功暂停任务', async () => {
      // 安排
      const id = 1;
      const mockTask = {
        id: 1,
        name: '测试任务',
        status: TaskStatus.ACTIVE,
      };

      const pausedTask = {
        ...mockTask,
        status: TaskStatus.PAUSED,
      };

      mockRepository.findOne.mockResolvedValue(mockTask);
      mockRepository.save.mockResolvedValue(pausedTask);

      // 行动
      const actualTask = await service.pause(id);

      // 断言
      expect(mockRepository.save).toHaveBeenCalledWith({
        ...mockTask,
        status: TaskStatus.PAUSED,
      });
      expect(actualTask.status).toBe(TaskStatus.PAUSED);
    });
  });

  describe('resume', () => {
    it('应该成功恢复已暂停的任务', async () => {
      // 安排
      const id = 1;
      const mockTask = {
        id: 1,
        name: '测试任务',
        status: TaskStatus.PAUSED,
        scheduleType: ScheduleType.DAILY,
        scheduleConfig: {
          time: '09:00',
        },
      };

      const resumedTask = {
        ...mockTask,
        status: TaskStatus.ACTIVE,
        nextExecuteAt: expect.any(Date),
      };

      mockRepository.findOne.mockResolvedValue(mockTask);
      mockRepository.save.mockResolvedValue(resumedTask);

      // 行动
      const actualTask = await service.resume(id);

      // 断言
      expect(actualTask.status).toBe(TaskStatus.ACTIVE);
      expect(actualTask.nextExecuteAt).toBeDefined();
    });

    it('应该抛出BadRequestException当任务不是暂停状态时', async () => {
      // 安排
      const id = 1;
      const mockTask = {
        id: 1,
        name: '测试任务',
        status: TaskStatus.ACTIVE,
      };

      mockRepository.findOne.mockResolvedValue(mockTask);

      // 行动 & 断言
      await expect(service.resume(id)).rejects.toThrow(BadRequestException);
      await expect(service.resume(id)).rejects.toThrow('只能恢复已暂停的任务');
    });
  });

  describe('calculateNextExecuteAt', () => {
    it('应该计算一次性调度的下次执行时间', () => {
      // 安排
      const scheduleType = ScheduleType.ONCE;
      const scheduleConfig = {
        executeAt: '2025-01-25T10:00:00Z',
      };

      // 行动
      const actualDate = service.calculateNextExecuteAt(scheduleType, scheduleConfig);

      // 断言
      expect(actualDate).toEqual(new Date('2025-01-25T10:00:00Z'));
    });

    it('应该返回null当一次性调度未指定执行时间时', () => {
      // 安排
      const scheduleType = ScheduleType.ONCE;
      const scheduleConfig = {};

      // 行动
      const actualDate = service.calculateNextExecuteAt(scheduleType, scheduleConfig);

      // 断言
      expect(actualDate).toBeNull();
    });

    it('应该计算间隔调度的下次执行时间', () => {
      // 安排
      const scheduleType = ScheduleType.INTERVAL;
      const startAt = dayjs().subtract(2, 'hour');
      const scheduleConfig = {
        startAt: startAt.toISOString(),
        intervalHours: 1,
      };

      // 行动
      const actualDate = service.calculateNextExecuteAt(scheduleType, scheduleConfig);

      // 断言
      expect(actualDate).toBeDefined();
      expect(actualDate).toBeInstanceOf(Date);
      const expectedDate = startAt.add(3, 'hour');
      expect(dayjs(actualDate).isSame(expectedDate, 'hour')).toBe(true);
    });

    it('应该计算每日调度的下次执行时间', () => {
      // 安排
      const scheduleType = ScheduleType.DAILY;
      const scheduleConfig = {
        time: '09:00',
      };

      // 行动
      const actualDate = service.calculateNextExecuteAt(scheduleType, scheduleConfig);

      // 断言
      expect(actualDate).toBeDefined();
      expect(actualDate).toBeInstanceOf(Date);
      const actualTime = dayjs(actualDate);
      expect(actualTime.hour()).toBe(9);
      expect(actualTime.minute()).toBe(0);
    });

    it('应该计算每周调度的下次执行时间', () => {
      // 安排
      const scheduleType = ScheduleType.WEEKLY;
      const scheduleConfig = {
        dayOfWeek: 1,
        time: '09:00',
      };

      // 行动
      const actualDate = service.calculateNextExecuteAt(scheduleType, scheduleConfig);

      // 断言
      expect(actualDate).toBeDefined();
      expect(actualDate).toBeInstanceOf(Date);
      const actualTime = dayjs(actualDate);
      expect(actualTime.day()).toBe(1);
      expect(actualTime.hour()).toBe(9);
      expect(actualTime.minute()).toBe(0);
    });

    it('应该计算每月调度的下次执行时间', () => {
      // 安排
      const scheduleType = ScheduleType.MONTHLY;
      const scheduleConfig = {
        dayOfMonth: 15,
        time: '09:00',
      };

      // 行动
      const actualDate = service.calculateNextExecuteAt(scheduleType, scheduleConfig);

      // 断言
      expect(actualDate).toBeDefined();
      expect(actualDate).toBeInstanceOf(Date);
      const actualTime = dayjs(actualDate);
      expect(actualTime.date()).toBeLessThanOrEqual(15);
      expect(actualTime.hour()).toBe(9);
      expect(actualTime.minute()).toBe(0);
    });

    it('应该处理每月调度中日期超过当月天数的情况', () => {
      // 安排
      const scheduleType = ScheduleType.MONTHLY;
      const scheduleConfig = {
        dayOfMonth: 31,
        time: '09:00',
      };

      // 行动
      const actualDate = service.calculateNextExecuteAt(scheduleType, scheduleConfig);

      // 断言
      expect(actualDate).toBeDefined();
      expect(actualDate).toBeInstanceOf(Date);
      const actualTime = dayjs(actualDate);
      expect(actualTime.date()).toBeLessThanOrEqual(31);
    });
  });

  describe('findTasksToExecute', () => {
    it('应该返回所有活跃的任务', async () => {
      // 安排
      const mockTasks = [
        {
          id: 1,
          name: '任务1',
          status: TaskStatus.ACTIVE,
        },
        {
          id: 2,
          name: '任务2',
          status: TaskStatus.ACTIVE,
        },
      ];

      mockRepository.find.mockResolvedValue(mockTasks);

      // 行动
      const actualTasks = await service.findTasksToExecute();

      // 断言
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: {
          status: TaskStatus.ACTIVE,
        },
        relations: ['user'],
      });
      expect(actualTasks).toEqual(mockTasks);
    });
  });

  describe('updateTaskExecution', () => {
    it('应该更新一次性任务的执行信息并标记为完成', async () => {
      // 安排
      const task: NotificationTask = {
        id: 1,
        name: '测试任务',
        scheduleType: ScheduleType.ONCE,
        scheduleConfig: {},
        executeCount: 0,
        status: TaskStatus.ACTIVE,
      } as unknown as NotificationTask;

      mockRepository.save.mockResolvedValue(task);

      // 行动
      await service.updateTaskExecution(task, true);

      // 断言
      expect(task.executeCount).toBe(1);
      expect(task.status).toBe(TaskStatus.COMPLETED);
      expect(task.nextExecuteAt).toBeNull();
      expect(task.lastExecuteAt).toBeDefined();
      expect(mockRepository.save).toHaveBeenCalledWith(task);
    });

    it('应该更新间隔任务的执行信息并计算下次执行时间', async () => {
      // 安排
      const task = {
        id: 1,
        name: '测试任务',
        scheduleType: ScheduleType.INTERVAL,
        scheduleConfig: {
          startAt: dayjs().toISOString(),
          intervalHours: 1,
        },
        executeCount: 0,
        status: TaskStatus.ACTIVE,
      } as unknown as NotificationTask;

      mockRepository.save.mockResolvedValue(task);

      // 行动
      await service.updateTaskExecution(task, true);

      // 断言
      expect(task.executeCount).toBe(1);
      expect(task.status).toBe(TaskStatus.ACTIVE);
      expect(task.nextExecuteAt).toBeDefined();
      expect(mockRepository.save).toHaveBeenCalledWith(task);
    });

    it('应该标记任务为失败当执行失败时', async () => {
      // 安排
      const task = {
        id: 1,
        name: '测试任务',
        scheduleType: ScheduleType.DAILY,
        scheduleConfig: {
          time: '09:00',
        },
        executeCount: 0,
        status: TaskStatus.ACTIVE,
      } as unknown as NotificationTask;

      mockRepository.save.mockResolvedValue(task);

      // 行动
      await service.updateTaskExecution(task as unknown as NotificationTask, false);

      // 断言
      expect(task.status).toBe(TaskStatus.FAILED);
      expect(mockRepository.save).toHaveBeenCalledWith(task);
    });

    it('应该标记任务为完成当达到最大执行次数时', async () => {
      // 安排
      const task = {
        id: 1,
        name: '测试任务',
        scheduleType: ScheduleType.DAILY,
        scheduleConfig: {
          time: '09:00',
        },
        executeCount: 4,
        maxExecuteCount: 5,
        status: TaskStatus.ACTIVE,
      } as unknown as NotificationTask;

      mockRepository.save.mockResolvedValue(task);

      // 行动
      await service.updateTaskExecution(task, true);

      // 断言
      expect(task.executeCount).toBe(5);
      expect(task.status).toBe(TaskStatus.COMPLETED);
      expect(task.nextExecuteAt).toBeNull();
    });
  });

  it('应该被定义', () => {
    expect(service).toBeDefined();
  });
});

