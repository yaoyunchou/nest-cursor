import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dictionary } from './entities/dictionary.entity';
import { CreateDictionaryDto } from './dto/create-dictionary.dto';
import { UpdateDictionaryDto } from './dto/update-dictionary.dto';
import { UpdateDictionaryValueDto } from './dto/update-dictionary-value.dto';
import { QueryDictionaryDto } from './dto/query-dictionary.dto';
import { ListResponse } from '@/models/list-response.model';

/**
 * 字典服务
 */
@Injectable()
export class DictionaryService {
  constructor(
    @InjectRepository(Dictionary)
    private readonly dictionaryRepository: Repository<Dictionary>,
  ) {}

  /**
   * 创建字典
   */
  async create(createDictionaryDto: CreateDictionaryDto): Promise<Dictionary> {
    const dictionary = this.dictionaryRepository.create(createDictionaryDto);
    return this.dictionaryRepository.save(dictionary);
  }

  /**
   * 批量创建字典
   */
  async createBatch(createDictionaryDtos: CreateDictionaryDto[]): Promise<Dictionary[]> {
    const dictionaries = this.dictionaryRepository.create(createDictionaryDtos);
    return this.dictionaryRepository.save(dictionaries);
  }

  /**
   * 获取字典列表
   */
  async findAll(query: QueryDictionaryDto): Promise<ListResponse<Dictionary>> {
    const { category, name, page = 1, pageSize = 10 } = query;
    
    const queryBuilder = this.dictionaryRepository.createQueryBuilder('dictionary');
    
    if (category) {
      queryBuilder.andWhere('dictionary.category = :category', { category });
    }
    
    if (name) {
      queryBuilder.andWhere('dictionary.name = :name', { name });
    }
    
    queryBuilder.andWhere('dictionary.isEnabled = :isEnabled', { isEnabled: true });
    queryBuilder.orderBy('dictionary.sort', 'DESC');
    queryBuilder.addOrderBy('dictionary.createdAt', 'DESC');
    
    const [list, total] = await queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();
    
    return {
      total,
      page,
      pageSize,
      list,
    };
  }

  /**
   * 根据分类获取字典列表
   */
  async findByCategory(category: string): Promise<Dictionary[]> {
    return this.dictionaryRepository.find({
      where: { category, isEnabled: true },
      order: { sort: 'DESC', createdAt: 'DESC' },
    });
  }

  /**
   * 根据分类和名称获取字典
   */
  async findByCategoryAndName(category: string, name: string): Promise<Dictionary | null> {
    return this.dictionaryRepository.findOne({
      where: { category, name, isEnabled: true },
    });
  }

  /**
   * 根据ID获取字典
   */
  async findOne(id: number): Promise<Dictionary | null> {
    return this.dictionaryRepository.findOne({
      where: { id },
    });
  }

  /**
   * 更新字典
   */
  async update(id: number, updateDictionaryDto: UpdateDictionaryDto): Promise<Dictionary | null> {
    const dictionary = await this.findOne(id);
    if (!dictionary) {
      throw new NotFoundException(`字典ID ${id} 不存在`);
    }
    
    Object.assign(dictionary, updateDictionaryDto);
    return this.dictionaryRepository.save(dictionary);
  }

  /**
   * 快速更新字典值
   */
  async updateValue(updateDictionaryValueDto: UpdateDictionaryValueDto): Promise<Dictionary | null> {
    const { category, name, value } = updateDictionaryValueDto;
    const dictionary = await this.dictionaryRepository.findOne({
      where: { category, name, isEnabled: true },
    });
    
    if (!dictionary) {
      throw new NotFoundException(`字典分类 '${category}' 和名称 '${name}' 不存在`);
    }
    
    dictionary.value = value;
    return this.dictionaryRepository.save(dictionary);
  }

  /**
   * 删除字典
   */
  async remove(id: number): Promise<void> {
    const dictionary = await this.findOne(id);
    if (!dictionary) {
      throw new NotFoundException(`字典ID ${id} 不存在`);
    }
    
    await this.dictionaryRepository.remove(dictionary);
  }

  /**
   * 获取所有分类
   */
  async getCategories(): Promise<string[]> {
    const result = await this.dictionaryRepository
      .createQueryBuilder('dictionary')
      .select('DISTINCT dictionary.category', 'category')
      .where('dictionary.isEnabled = :isEnabled', { isEnabled: true })
      .getRawMany();
    
    return result.map(item => item.category);
  }
} 