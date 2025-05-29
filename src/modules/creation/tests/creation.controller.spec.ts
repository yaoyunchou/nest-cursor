/*
 * @Author: yaoyc yaoyunchou@bananain.com
 * @Date: 2025-01-18 10:00:44
 * @LastEditors: yaoyc yaoyunchou@bananain.com
 * @LastEditTime: 2025-01-18 10:00:44
 * @FilePath: \nest-cursor\src\modules\creation\tests\creation.controller.spec.ts
 * @Description: 创作控制器测试
 */
import { Test, TestingModule } from '@nestjs/testing';
import { CreationController } from '../creation.controller';
import { CreationService } from '../creation.service';
import { CreateCreationDto } from '../dto/create-creation.dto';
import { QueryCreationDto } from '../dto/query-creation.dto';

describe('CreationController', () => {
  let controller: CreationController;
  let service: CreationService;

  const mockCreationService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findPublicCreations: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    togglePublic: jest.fn(),
    likeCreation: jest.fn(),
    unlikeCreation: jest.fn(),
    collectCreation: jest.fn(),
    uncollectCreation: jest.fn(),
    getUserCollections: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CreationController],
      providers: [
        {
          provide: CreationService,
          useValue: mockCreationService,
        },
      ],
    }).compile();

    controller = module.get<CreationController>(CreationController);
    service = module.get<CreationService>(CreationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('应该成功创建作品', async () => {
      // 安排
      const createCreationDto: CreateCreationDto = {
        title: '测试作品',
        prompt: '测试提示词',
        images: ['https://example.com/image.jpg'],
        isPublic: false,
      };
      const mockRequest = { user: { id: 1 } };
      const expectedCreation = { id: 1, ...createCreationDto, userId: 1 };

      mockCreationService.create.mockResolvedValue(expectedCreation);

      // 行动
      const actualCreation = await controller.create(createCreationDto, mockRequest);

      // 断言
      expect(mockCreationService.create).toHaveBeenCalledWith(createCreationDto, 1);
      expect(actualCreation).toEqual(expectedCreation);
    });

    it('应该使用默认用户ID当请求中没有用户信息时', async () => {
      // 安排
      const createCreationDto: CreateCreationDto = {
        title: '测试作品',
        prompt: '测试提示词',
      };
      const expectedCreation = { id: 1, ...createCreationDto, userId: 1 };

      mockCreationService.create.mockResolvedValue(expectedCreation);

      // 行动
      const actualCreation = await controller.create(createCreationDto);

      // 断言
      expect(mockCreationService.create).toHaveBeenCalledWith(createCreationDto, 1);
      expect(actualCreation).toEqual(expectedCreation);
    });
  });

  describe('findAll', () => {
    it('应该成功查询作品列表', async () => {
      // 安排
      const query: QueryCreationDto = {
        title: '测试',
        page: 1,
        limit: 10,
      };
      const mockRequest = { user: { id: 1 } };
      const expectedResult = {
        list: [],
        total: 0,
        pageSize: 10,
        pageIndex: 1,
      };

      mockCreationService.findAll.mockResolvedValue(expectedResult);

      // 行动
      const actualResult = await controller.findAll(query, mockRequest);

      // 断言
      expect(mockCreationService.findAll).toHaveBeenCalledWith(query, 1);
      expect(actualResult).toEqual(expectedResult);
    });
  });

  describe('findPublicCreations', () => {
    it('应该成功查询公开作品列表', async () => {
      // 安排
      const query: QueryCreationDto = {
        page: 1,
        limit: 10,
      };
      const expectedResult = {
        list: [],
        total: 0,
        pageSize: 10,
        pageIndex: 1,
      };

      mockCreationService.findPublicCreations.mockResolvedValue(expectedResult);

      // 行动
      const actualResult = await controller.findPublicCreations(query);

      // 断言
      expect(mockCreationService.findPublicCreations).toHaveBeenCalledWith(query);
      expect(actualResult).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('应该成功查询单个作品', async () => {
      // 安排
      const id = 1;
      const mockRequest = { user: { id: 1 } };
      const expectedCreation = {
        id: 1,
        title: '测试作品',
        userId: 1,
      };

      mockCreationService.findOne.mockResolvedValue(expectedCreation);

      // 行动
      const actualCreation = await controller.findOne(id, mockRequest);

      // 断言
      expect(mockCreationService.findOne).toHaveBeenCalledWith(id, 1);
      expect(actualCreation).toEqual(expectedCreation);
    });
  });

  describe('remove', () => {
    it('应该成功删除作品', async () => {
      // 安排
      const id = 1;
      const mockRequest = { user: { id: 1 } };

      mockCreationService.remove.mockResolvedValue(undefined);

      // 行动
      const actualResult = await controller.remove(id, mockRequest);

      // 断言
      expect(mockCreationService.remove).toHaveBeenCalledWith(id, 1);
      expect(actualResult).toEqual({ message: '作品删除成功' });
    });
  });

  describe('likeCreation', () => {
    it('应该成功点赞作品', async () => {
      // 安排
      const id = 1;
      const mockRequest = { user: { id: 2 } };
      const expectedCreation = {
        id: 1,
        title: '测试作品',
        likes: 6,
      };

      mockCreationService.likeCreation.mockResolvedValue(expectedCreation);

      // 行动
      const actualCreation = await controller.likeCreation(id, mockRequest);

      // 断言
      expect(mockCreationService.likeCreation).toHaveBeenCalledWith(id, 2);
      expect(actualCreation).toEqual(expectedCreation);
    });
  });

  describe('adminTest', () => {
    it('应该返回测试信息', async () => {
      // 行动
      const actualResult = await controller.adminTest();

      // 断言
      expect(actualResult).toHaveProperty('message', 'Creation模块运行正常');
      expect(actualResult).toHaveProperty('timestamp');
      expect(typeof actualResult.timestamp).toBe('string');
    });
  });

  it('应该被定义', () => {
    expect(controller).toBeDefined();
  });
}); 