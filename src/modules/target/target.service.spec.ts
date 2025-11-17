import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TargetService } from './target.service';
import { Target } from './entities/target.entity';
import { Task } from './entities/task.entity';
import { User } from '../user/entities/user.entity';

describe('TargetService', () => {
  let service: TargetService;
  let targetRepository: Repository<Target>;
  let taskRepository: Repository<Task>;
  let userRepository: Repository<User>;

  const mockTargetRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockTaskRepository = {
    find: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TargetService,
        {
          provide: getRepositoryToken(Target),
          useValue: mockTargetRepository,
        },
        {
          provide: getRepositoryToken(Task),
          useValue: mockTaskRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<TargetService>(TargetService);
    targetRepository = module.get<Repository<Target>>(getRepositoryToken(Target));
    taskRepository = module.get<Repository<Task>>(getRepositoryToken(Task));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new target', async () => {
      const createTargetDto = {
        name: '测试目标',
        description: '测试描述',
        plannedHours: 100,
        startTime: new Date('2025-01-01'),
        endTime: new Date('2025-12-31'),
      };

      const expectedTarget = {
        id: 1,
        ...createTargetDto,
      };

      mockTargetRepository.create.mockReturnValue(expectedTarget);
      mockTargetRepository.save.mockResolvedValue(expectedTarget);

      const result = await service.create(createTargetDto);
      expect(result).toEqual(expectedTarget);
    });
  });
}); 