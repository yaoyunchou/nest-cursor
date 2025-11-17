import { Test, TestingModule } from '@nestjs/testing';
import { UserActionController } from '../user-action.controller';
import { UserActionService } from '../user-action.service';
import { CheckInDto, CheckInType } from '../dto/check-in.dto';

const mockUserActionService = {
  executeCheckIn: jest.fn(),
  getRecords: jest.fn(),
};

describe('UserActionController', () => {
  let controller: UserActionController;
  let service: UserActionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserActionController],
      providers: [
        { provide: UserActionService, useValue: mockUserActionService },
      ],
    }).compile();
    controller = module.get<UserActionController>(UserActionController);
    service = module.get<UserActionService>(UserActionService);
    jest.clearAllMocks();
  });

  it('应调用服务执行打卡', async () => {
    const input: CheckInDto = {
      userId: 'user1',
      type: CheckInType.Morning,
      checkInTime: '2024-06-01T08:00:00Z',
    };
    mockUserActionService.executeCheckIn.mockResolvedValue({ id: '1', ...input, date: '2024-06-01' });
    const result = await controller.executeCheckIn(input);
    expect(service.executeCheckIn).toHaveBeenCalledWith(input);
    expect(result.id).toBe('1');
  });

  it('应调用服务查询打卡记录', async () => {
    mockUserActionService.getRecords.mockResolvedValue([{ id: '2', userId: 'user2', type: CheckInType.Evening, checkInTime: '2024-06-01T20:00:00Z', date: '2024-06-01' }]);
    const result = await controller.getRecords('user2', '2024-06-01');
    expect(service.getRecords).toHaveBeenCalledWith({ userId: 'user2', date: '2024-06-01' });
    expect(result.length).toBe(1);
  });
}); 