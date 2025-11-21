import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserActionService } from '../user-action.service';
import { UserActionEntity } from '../entities/user-action.entity';
import { CheckInDto, CheckInType } from '../dto/check-in.dto';

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
  });

  it('应允许用户早晚各打卡一次', async () => {
    const inputMorning: CheckInDto = {
      userId: 'user1',
      type: CheckInType.Morning,
      checkInTime: '2024-06-01T08:00:00Z',
    };
    const inputEvening: CheckInDto = {
      userId: 'user1',
      type: CheckInType.Evening,
      checkInTime: '2024-06-01T20:00:00Z',
    };
    const recordMorning = await service.executeCheckIn(inputMorning);
    const recordEvening = await service.executeCheckIn(inputEvening);
    expect(recordMorning.type).toBe(CheckInType.Morning);
    expect(recordEvening.type).toBe(CheckInType.Evening);
  });

  it('应禁止同一用户同一天同一时段重复打卡', async () => {
    const input: CheckInDto = {
      userId: 'user2',
      type: CheckInType.Morning,
      checkInTime: '2024-06-02T08:00:00Z',
    };
    await service.executeCheckIn(input);
    await expect(service.executeCheckIn(input)).rejects.toThrow('当天该时段已打卡');
  });

  it('应能查询用户某天的打卡记录', async () => {
    const input: CheckInDto = {
      userId: 'user3',
      type: CheckInType.Morning,
      checkInTime: '2024-06-03T08:00:00Z',
    };
    await service.executeCheckIn(input);
    const records = await service.getRecords({ userId: 'user3', date: '2024-06-03' });
    expect(records.list.length).toBe(1);
    expect(records.list[0].userId).toBe('user3');
    expect(records.list[0].date).toBe('2024-06-03');
  });
}); 