/*
 * @Author: yaoyc yaoyunchou@bananain.com
 * @Date: 2025-01-18 10:00:44
 * @LastEditors: yaoyc yaoyunchou@bananain.com
 * @LastEditTime: 2025-01-18 10:00:44
 * @FilePath: \nest-cursor\src\modules\creation\tests\creation.service.spec.ts
 * @Description: 创作服务测试
 */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreationService } from '../creation.service';
import { Creation } from '../entities/creation.entity';
import { UserCollection } from '../entities/user-collection.entity';
import { CreateCreationDto } from '../dto/create-creation.dto';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('CreationService', () => {
  let service: CreationService;
  let creationRepository: Repository<Creation>;
  let userCollectionRepository: Repository<UserCollection>;

  const mockCreationRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockUserCollectionRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreationService,
        {
          provide: getRepositoryToken(Creation),
          useValue: mockCreationRepository,
        },
        {
          provide: getRepositoryToken(UserCollection),
          useValue: mockUserCollectionRepository,
        },
      ],
    }).compile();

    service = module.get<CreationService>(CreationService);
    creationRepository = module.get<Repository<Creation>>(getRepositoryToken(Creation));
    userCollectionRepository = module.get<Repository<UserCollection>>(getRepositoryToken(UserCollection));
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
        type: 'text',
        images: ['https://example.com/image.jpg'],
        isPublic: false,
      };
      const userId = 1;
      const expectedCreation = { id: 1, ...createCreationDto, userId };

      mockCreationRepository.create.mockReturnValue(expectedCreation);
      mockCreationRepository.save.mockResolvedValue(expectedCreation);

      // 行动
      const actualCreation = await service.create(createCreationDto, userId);

      // 断言
      expect(mockCreationRepository.create).toHaveBeenCalledWith({
        ...createCreationDto,
        user: { id: userId },
        images: createCreationDto.images,
      });
      expect(mockCreationRepository.save).toHaveBeenCalledWith(expectedCreation);
      expect(actualCreation).toEqual(expectedCreation);
    });

    it('应该处理空图片数组', async () => {
      // 安排
      const createCreationDto: CreateCreationDto = {
        title: '测试作品',
        prompt: '测试提示词',
        type: 'text',
      };
      const userId = 1;
      const expectedCreation = { id: 1, ...createCreationDto, userId, images: [] };

      mockCreationRepository.create.mockReturnValue(expectedCreation);
      mockCreationRepository.save.mockResolvedValue(expectedCreation);

      // 行动
      const actualCreation = await service.create(createCreationDto, userId);

      // 断言
      expect(mockCreationRepository.create).toHaveBeenCalledWith({
        ...createCreationDto,
        user: { id: userId },
        images: [],
      });
      expect(actualCreation).toEqual(expectedCreation);
    });
  });

  describe('findOne', () => {
    it('应该成功查找公开作品', async () => {
      // 安排
      const id = 1;
      const mockCreation = {
        id: 1,
        title: '测试作品',
        status: 1,
        user: { id: 1 },
      };

      mockCreationRepository.findOne.mockResolvedValue(mockCreation);

      // 行动
      const actualCreation = await service.findOne(id);

      // 断言
      expect(mockCreationRepository.findOne).toHaveBeenCalledWith({
        where: { id },
        relations: ['user'],
      });
      expect(actualCreation).toEqual(mockCreation);
    });

    it('应该抛出NotFoundException当作品不存在时', async () => {
      // 安排
      const id = 999;
      mockCreationRepository.findOne.mockResolvedValue(null);

      // 行动 & 断言
      await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
      expect(mockCreationRepository.findOne).toHaveBeenCalledWith({
        where: { id },
        relations: ['user'],
      });
    });

    it('应该抛出ForbiddenException当尝试查看他人私有作品时', async () => {
      // 安排
      const id = 1;
      const currentUserId = 2;
      const mockCreation = {
        id: 1,
        title: '私有作品',
        status: 0,
        user: { id: 1 },
      };

      mockCreationRepository.findOne.mockResolvedValue(mockCreation);

      // 行动 & 断言
      await expect(service.findOne(id, currentUserId)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('likeCreation', () => {
    it('应该成功点赞公开作品', async () => {
      // 安排
      const id = 1;
      const userId = 2;
      const mockCreation = {
        id: 1,
        title: '测试作品',
        status: 1,
        user: { id: 1 },
        likes: 5,
      };
      const expectedCreation = { ...mockCreation, likes: 6 };

      mockCreationRepository.findOne.mockResolvedValue(mockCreation);
      mockCreationRepository.save.mockResolvedValue(expectedCreation);

      // 行动
      const actualCreation = await service.likeCreation(id, userId);

      // 断言
      expect(actualCreation.likes).toBe(6);
      expect(mockCreationRepository.save).toHaveBeenCalledWith(mockCreation);
    });

    it('应该抛出ForbiddenException当尝试点赞私有作品时', async () => {
      // 安排
      const id = 1;
      const userId = 2;
      const mockCreation = {
        id: 1,
        title: '私有作品',
        status: 0,
        user: { id: 1 },
        likes: 5,
      };

      mockCreationRepository.findOne.mockResolvedValue(mockCreation);

      // 行动 & 断言
      await expect(service.likeCreation(id, userId)).rejects.toThrow(ForbiddenException);
    });

    it('应该抛出ForbiddenException当尝试点赞自己的作品时', async () => {
      // 安排
      const id = 1;
      const userId = 1;
      const mockCreation = {
        id: 1,
        title: '我的作品',
        status: 1,
        user: { id: 1 },
        likes: 5,
      };

      mockCreationRepository.findOne.mockResolvedValue(mockCreation);

      // 行动 & 断言
      await expect(service.likeCreation(id, userId)).rejects.toThrow(ForbiddenException);
    });
  });

  it('应该被定义', () => {
    expect(service).toBeDefined();
  });
}); 