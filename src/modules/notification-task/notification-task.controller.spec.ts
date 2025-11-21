/*
 * @Description: 通知任务控制器测试
 */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { NotificationTaskController } from './notification-task.controller';
import { NotificationTaskService } from './notification-task.service';
import { NotificationService } from './services/notification.service';
import { NotificationTask, NotificationChannel, ScheduleType, TaskStatus } from './entities/notification-task.entity';
import { CreateNotificationTaskDto } from './dto/create-notification-task.dto';
import { UpdateNotificationTaskDto } from './dto/update-notification-task.dto';
import { QueryNotificationTaskDto } from './dto/query-notification-task.dto';

describe('NotificationTaskController', () => {
  let controller: NotificationTaskController;
  let taskService: NotificationTaskService;
  let notificationService: NotificationService;

  const mockTaskService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    pause: jest.fn(),
    resume: jest.fn(),
  };

  const mockNotificationService = {
    send: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationTaskController],
      providers: [
        {
          provide: NotificationTaskService,
          useValue: mockTaskService,
        },
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
      ],
    }).compile();

    controller = module.get<NotificationTaskController>(NotificationTaskController);
    taskService = module.get<NotificationTaskService>(NotificationTaskService);
    notificationService = module.get<NotificationService>(NotificationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('应该成功创建通知任务', async () => {
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
      } as unknown as NotificationTask;

      mockTaskService.create.mockResolvedValue(expectedTask);

      // 行动
      const actualTask = await controller.create(createDto);

      // 断言
      expect(mockTaskService.create).toHaveBeenCalledWith(createDto);
      expect(actualTask).toEqual(expectedTask);
    });
  });

  describe('findAll', () => {
    it('应该成功查询任务列表', async () => {
      // 安排
      const query: QueryNotificationTaskDto = {
        pageSize: 10,
        pageIndex: 1,
      };

      const expectedResult = {
        list: [
          {
            id: 1,
            name: '任务1',
          },
          {
            id: 2,
            name: '任务2',
          },
        ],
        total: 2,
        pageSize: 10,
        pageIndex: 1,
      };

      mockTaskService.findAll.mockResolvedValue(expectedResult);

      // 行动
      const actualResult = await controller.findAll(query);

      // 断言
      expect(mockTaskService.findAll).toHaveBeenCalledWith(query);
      expect(actualResult).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('应该成功查询单个任务', async () => {
      // 安排
      const id = 1;
      const expectedTask: NotificationTask = {
        id: 1,
        name: '测试任务',
        userId: 1,
        channel: NotificationChannel.FEISHU,
      } as unknown as NotificationTask;

      mockTaskService.findOne.mockResolvedValue(expectedTask);

      // 行动
      const actualTask = await controller.findOne(id);

      // 断言
      expect(mockTaskService.findOne).toHaveBeenCalledWith(id);
      expect(actualTask).toEqual(expectedTask);
    });

    it('应该抛出NotFoundException当任务不存在时', async () => {
      // 安排
      const id = 999;
      mockTaskService.findOne.mockRejectedValue(new NotFoundException('任务ID 999 未找到'));

      // 行动 & 断言
      await expect(controller.findOne(id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('应该成功更新任务', async () => {
      // 安排
      const id = 1;
      const updateDto: UpdateNotificationTaskDto = {
        name: '更新后的任务名',
      };

      const expectedTask: NotificationTask = {
        id: 1,
        name: '更新后的任务名',
        userId: 1,
      } as unknown as NotificationTask;

      mockTaskService.update.mockResolvedValue(expectedTask);

      // 行动
      const actualTask = await controller.update(id, updateDto);

      // 断言
      expect(mockTaskService.update).toHaveBeenCalledWith(id, updateDto);
      expect(actualTask).toEqual(expectedTask);
    });
  });

  describe('remove', () => {
    it('应该成功删除任务', async () => {
      // 安排
      const id = 1;
      mockTaskService.remove.mockResolvedValue(undefined);

      // 行动
      const actualResult = await controller.remove(id);

      // 断言
      expect(mockTaskService.remove).toHaveBeenCalledWith(id);
      expect(actualResult).toEqual({ message: '删除成功' });
    });
  });

  describe('pause', () => {
    it('应该成功暂停任务', async () => {
      // 安排
      const id = 1;
      const expectedTask: NotificationTask = {
        id: 1,
        name: '测试任务',
        status: TaskStatus.PAUSED,
      } as unknown as NotificationTask;

      mockTaskService.pause.mockResolvedValue(expectedTask);

      // 行动
      const actualTask = await controller.pause(id);

      // 断言
      expect(mockTaskService.pause).toHaveBeenCalledWith(id);
      expect(actualTask).toEqual(expectedTask);
      expect(actualTask.status).toBe(TaskStatus.PAUSED);
    });
  });

  describe('resume', () => {
    it('应该成功恢复任务', async () => {
      // 安排
      const id = 1;
      const expectedTask: NotificationTask = {
        id: 1,
        name: '测试任务',
        status: TaskStatus.ACTIVE,
      } as unknown as NotificationTask;

      mockTaskService.resume.mockResolvedValue(expectedTask);

      // 行动
      const actualTask = await controller.resume(id);

      // 断言
      expect(mockTaskService.resume).toHaveBeenCalledWith(id);
      expect(actualTask).toEqual(expectedTask);
      expect(actualTask.status).toBe(TaskStatus.ACTIVE);
    });
  });

  describe('execute', () => {
    it('应该成功手动执行任务', async () => {
      // 安排
      const id = 1;
      const mockTask: NotificationTask = {
        id: 1,
        name: '测试任务',
        userId: 1,
        channel: NotificationChannel.FEISHU,
        channelConfig: {},
        content: {},
      } as unknown as NotificationTask;

      const expectedResult = {
        success: true,
        message: '通知发送成功',
        data: {},
      };

      mockTaskService.findOne.mockResolvedValue(mockTask);
      mockNotificationService.send.mockResolvedValue(expectedResult);

      // 行动
      const actualResult = await controller.execute(id);

      // 断言
      expect(mockTaskService.findOne).toHaveBeenCalledWith(id);
      expect(mockNotificationService.send).toHaveBeenCalledWith(mockTask);
      expect(actualResult).toEqual(expectedResult);
    });

    it('应该抛出NotFoundException当任务不存在时', async () => {
      // 安排
      const id = 999;
      mockTaskService.findOne.mockRejectedValue(new NotFoundException('任务ID 999 未找到'));

      // 行动 & 断言
      await expect(controller.execute(id)).rejects.toThrow(NotFoundException);
      expect(mockNotificationService.send).not.toHaveBeenCalled();
    });
  });

  it('应该被定义', () => {
    expect(controller).toBeDefined();
  });
});

