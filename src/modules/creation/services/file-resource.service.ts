import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In, Between } from 'typeorm';
import { FileResource } from '../entities/file-resource.entity';
import { CreateFileResourceDto } from '../dto/create-file-resource.dto';
import { UpdateFileResourceDto } from '../dto/update-file-resource.dto';
import { QueryFileResourceDto } from '../dto/query-file-resource.dto';
import { ListResponse } from '../../../models/list-response.model';

/**
 * 图片资源服务
 */
@Injectable()
export class FileResourceService {
  constructor(
    @InjectRepository(FileResource)
    private readonly fileResourceRepository: Repository<FileResource>,
  ) {}

  /** 创建图片资源 */
  async createFileResource(dto: CreateFileResourceDto): Promise<FileResource> {
    const entity = this.fileResourceRepository.create(dto);
    return this.fileResourceRepository.save(entity);
  }

  /** 批量创建图片资源 */
  async createFileResources(dtos: CreateFileResourceDto[]): Promise<FileResource[]> {
    const entities = this.fileResourceRepository.create(dtos);
    return this.fileResourceRepository.save(entities);
  }

  /** 分页查询图片资源 */
  async getFileResourceList(query: QueryFileResourceDto): Promise<ListResponse<FileResource>> {
    const { page = 1, pageSize = 20, origin, tags, scene, type, weightMin, weightMax } = query;
    const where: any = {};
    if (origin) where.origin = origin;
    if (type) where.type = type;
    if (typeof weightMin === 'number' && typeof weightMax === 'number') {
      where.weight = Between(weightMin, weightMax);
    } else if (typeof weightMin === 'number') {
      where.weight = Between(weightMin, 100);
    } else if (typeof weightMax === 'number') {
      where.weight = Between(0, weightMax);
    }
    // tags/scene为数组，需特殊处理
    if (tags && tags.length > 0) where.tags = In(tags);
    if (scene && scene.length > 0) where.scene = In(scene);
    const [list, total] = await this.fileResourceRepository.findAndCount({
      where,
      order: { id: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return { total, page, pageSize, list };
  }

  /** 获取单个图片资源 */
  async getFileResourceById(id: number): Promise<FileResource | null> {
    return this.fileResourceRepository.findOneBy({ id });
  }

  /** 更新图片资源 */
  async updateFileResource(id: number, dto: UpdateFileResourceDto): Promise<FileResource | null> {
    await this.fileResourceRepository.update(id, dto);
    return this.getFileResourceById(id);
  }

  /** 软删除图片资源 */
  async deleteFileResource(id: number): Promise<void> {
    await this.fileResourceRepository.softDelete(id);
  }

  /** 恢复软删除的图片资源 */
  async restoreFileResource(id: number): Promise<void> {
    await this.fileResourceRepository.restore(id);
  }

  /** 统计热门图片资源（按usageCount降序） */
  async getHotFileResources(limit = 10): Promise<FileResource[]> {
    return this.fileResourceRepository.find({
      order: { usageCount: 'DESC' },
      take: limit,
    });
  }
} 