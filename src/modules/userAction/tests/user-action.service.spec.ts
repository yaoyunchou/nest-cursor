import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserActionService } from '../user-action.service';
import { UserActionEntity } from '../entities/user-action.entity';
import { CheckInDto, CheckInType } from '../dto/check-in.dto';
import * as dayjs from 'dayjs';

describe('UserActionService', () => {
  let service: UserActionService;
  let repository: Repository<UserActionEntity>;

  const mockRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserActionService,
        {
          provide: getRepositoryToken(UserActionEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UserActionService>(UserActionService);
    repository = module.get<Repository<UserActionEntity>>(getRepositoryToken(UserActionEntity));
    jest.clearAllMocks();
  });

  it('应允许用户早晚各打卡一次', async () => {
    // 安排 - 使用今天的日期
    const today = dayjs().format('YYYY-MM-DD');
    const now = new Date();
    const inputMorning: CheckInDto = {
      userId: 'user1',
      type: CheckInType.Morning,
      checkInTime: now.toISOString(),
    };
    const inputEvening: CheckInDto = {
      userId: 'user1',
      type: CheckInType.Evening,
      checkInTime: now.toISOString(),
    };

    // Mock第一次打卡（早上）- 不存在记录
    mockRepository.findOne.mockResolvedValueOnce(null);
    mockRepository.findOne.mockResolvedValueOnce(null); // 前一天记录也不存在
    const morningEntity = {
      id: 1,
      userId: 'user1',
      type: CheckInType.Morning,
      checkInTime: now,
      date: today,
      continuousCheckInCount: 1,
    };
    mockRepository.create.mockReturnValueOnce(morningEntity);
    mockRepository.save.mockResolvedValueOnce(morningEntity);

    // Mock第二次打卡（晚上）- 不存在记录
    mockRepository.findOne.mockResolvedValueOnce(null);
    mockRepository.findOne.mockResolvedValueOnce(null); // 前一天记录也不存在
    const eveningEntity = {
      id: 2,
      userId: 'user1',
      type: CheckInType.Evening,
      checkInTime: now,
      date: today,
      continuousCheckInCount: 1,
    };
    mockRepository.create.mockReturnValueOnce(eveningEntity);
    mockRepository.save.mockResolvedValueOnce(eveningEntity);

    // 行动
    const recordMorning = await service.executeCheckIn(inputMorning);
    const recordEvening = await service.executeCheckIn(inputEvening);

    // 断言
    expect(recordMorning.type).toBe(CheckInType.Morning);
    expect(recordEvening.type).toBe(CheckInType.Evening);
  });

  it('应禁止同一用户同一天同一时段重复打卡', async () => {
    // 安排 - 使用今天的日期
    const today = dayjs().format('YYYY-MM-DD');
    const now = new Date();
    const input: CheckInDto = {
      userId: 'user2',
      type: CheckInType.Morning,
      checkInTime: now.toISOString(),
    };

    // Mock第一次打卡 - 不存在记录
    mockRepository.findOne.mockResolvedValueOnce(null);
    mockRepository.findOne.mockResolvedValueOnce(null);
    const existingEntity = {
      id: 1,
      userId: 'user2',
      type: CheckInType.Morning,
      checkInTime: now,
      date: today,
      continuousCheckInCount: 1,
    };
    mockRepository.create.mockReturnValueOnce(existingEntity);
    mockRepository.save.mockResolvedValueOnce(existingEntity);

    // 第一次打卡
    const firstResult = await service.executeCheckIn(input);
    expect(firstResult.userId).toBe('user2');

    // Mock第二次打卡 - 已存在记录（会直接返回已存在的记录，不会抛出异常）
    mockRepository.findOne.mockResolvedValueOnce(existingEntity);

    // 行动 - 第二次打卡应该返回已存在的记录
    const secondResult = await service.executeCheckIn(input);

    // 断言 - 应该返回已存在的记录，而不是抛出异常
    expect(secondResult.userId).toBe('user2');
    expect(secondResult.type).toBe(CheckInType.Morning);
  });

  it('应能查询用户某天的打卡记录', async () => {
    // 安排
    const today = dayjs().format('YYYY-MM-DD');
    const now = new Date();
    const input: CheckInDto = {
      userId: 'user3',
      type: CheckInType.Morning,
      checkInTime: now.toISOString(),
    };

    // Mock打卡
    mockRepository.findOne.mockResolvedValueOnce(null);
    mockRepository.findOne.mockResolvedValueOnce(null);
    const savedEntity = {
      id: 1,
      userId: 'user3',
      type: CheckInType.Morning,
      checkInTime: now,
      date: today,
      continuousCheckInCount: 1,
    };
    mockRepository.create.mockReturnValueOnce(savedEntity);
    mockRepository.save.mockResolvedValueOnce(savedEntity);

    // 执行打卡
    await service.executeCheckIn(input);

    // Mock查询记录
    mockRepository.find.mockResolvedValueOnce([savedEntity]);

    // 行动
    const records = await service.getRecords({ userId: 'user3', date: today });

    // 断言
    expect(records.list.length).toBe(1);
    expect(records.list[0].userId).toBe('user3');
    expect(records.list[0].date).toBe(today);
  });
}); 