import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DictionaryService } from './dictionary.service';
import { Dictionary } from './entities/dictionary.entity';
import { CreateDictionaryDto } from './dto/create-dictionary.dto';
import { UpdateDictionaryDto } from './dto/update-dictionary.dto';
import { NotFoundException } from '@nestjs/common';

describe('DictionaryService', () => {
  let service: DictionaryService;
  let repository: Repository<Dictionary>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getRawMany: jest.fn(),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DictionaryService,
        {
          provide: getRepositoryToken(Dictionary),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<DictionaryService>(DictionaryService);
    repository = module.get<Repository<Dictionary>>(getRepositoryToken(Dictionary));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a dictionary', async () => {
      const createDto: CreateDictionaryDto = {
        category: 'system',
        name: 'status',
        value: 'active',
        sort: 0,
        isEnabled: true,
        remark: '系统状态',
      };

      const expectedDictionary = { id: 1, ...createDto, createdAt: new Date(), updatedAt: new Date() };
      mockRepository.create.mockReturnValue(expectedDictionary);
      mockRepository.save.mockResolvedValue(expectedDictionary);

      const result = await service.create(createDto);

      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockRepository.save).toHaveBeenCalledWith(expectedDictionary);
      expect(result).toEqual(expectedDictionary);
    });
  });

  describe('findByCategory', () => {
    it('should return dictionaries by category', async () => {
      const category = 'system';
      const expectedDictionaries = [
        { id: 1, category: 'system', name: 'status', value: 'active' },
        { id: 2, category: 'system', name: 'type', value: 'user' },
      ];

      mockRepository.find.mockResolvedValue(expectedDictionaries);

      const result = await service.findByCategory(category);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { category, isEnabled: true },
        order: { sort: 'DESC', createdAt: 'DESC' },
      });
      expect(result).toEqual(expectedDictionaries);
    });
  });

  describe('findByCategoryAndName', () => {
    it('should return dictionary by category and name', async () => {
      const category = 'system';
      const name = 'status';
      const expectedDictionary = { id: 1, category: 'system', name: 'status', value: 'active' };

      mockRepository.findOne.mockResolvedValue(expectedDictionary);

      const result = await service.findByCategoryAndName(category, name);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { category, name, isEnabled: true },
      });
      expect(result).toEqual(expectedDictionary);
    });
  });

  describe('update', () => {
    it('should update a dictionary', async () => {
      const id = 1;
      const updateDto: UpdateDictionaryDto = { value: 'inactive' };
      const existingDictionary = { id: 1, category: 'system', name: 'status', value: 'active' };
      const updatedDictionary = { ...existingDictionary, ...updateDto };

      mockRepository.findOne.mockResolvedValue(existingDictionary);
      mockRepository.save.mockResolvedValue(updatedDictionary);

      const result = await service.update(id, updateDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id } });
      expect(mockRepository.save).toHaveBeenCalledWith(updatedDictionary);
      expect(result).toEqual(updatedDictionary);
    });

    it('should throw NotFoundException when dictionary not found', async () => {
      const id = 999;
      const updateDto: UpdateDictionaryDto = { value: 'inactive' };

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(id, updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a dictionary', async () => {
      const id = 1;
      const existingDictionary = { id: 1, category: 'system', name: 'status', value: 'active' };

      mockRepository.findOne.mockResolvedValue(existingDictionary);
      mockRepository.remove.mockResolvedValue(undefined);

      await service.remove(id);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id } });
      expect(mockRepository.remove).toHaveBeenCalledWith(existingDictionary);
    });

    it('should throw NotFoundException when dictionary not found', async () => {
      const id = 999;

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(id)).rejects.toThrow(NotFoundException);
    });
  });
}); 