/*
 * @Author: yaoyc yaoyunchou@bananain.com
 * @Date: 2025-01-18 10:00:44
 * @LastEditors: yaoyc yaoyunchou@bananain.com
 * @LastEditTime: 2025-01-18 10:00:44
 * @FilePath: \nest-cursor\src\modules\file\file.service.ts
 * @Description: 文件服务
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from './entities/file.entity';
import { QiniuService } from './qiniu.service';
import { QueryFileDto } from './dto/query-file.dto';
import { PaginatedResponse } from '../../shared/interfaces/pagination.interface';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
    private readonly qiniuService: QiniuService,
  ) {}

  async upload(file: Express.Multer.File, userId: number): Promise<File> {
    const key = `${Date.now()}-${file.originalname}`;
    const url = this.qiniuService.getFileUrl(key);

    const fileEntity = this.fileRepository.create({
      filename: file.originalname,
      originalname: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      url,
      key,
      userId,
    });

    return await this.fileRepository.save(fileEntity);
  }

  async findAll(query: QueryFileDto): Promise<PaginatedResponse<File>> {
    const { filename, mimetype } = query;
    
    const queryBuilder = this.fileRepository.createQueryBuilder('file')
      .leftJoinAndSelect('file.user', 'user');

    if (filename) {
      queryBuilder.andWhere('file.filename LIKE :filename', { filename: `%${filename}%` });
    }

    if (mimetype) {
      queryBuilder.andWhere('file.mimetype = :mimetype', { mimetype });
    }

    const [list, total] = await queryBuilder

      .getManyAndCount();

    return {
      list,
      total,
      pageSize:0,
      pageIndex:0,
    };
  }

  async findOne(id: number): Promise<File> {
    const file = await this.fileRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    
    if (!file) {
      throw new NotFoundException(`文件ID ${id} 不存在`);
    }
    return file;
  }

  async remove(id: number, userId: number): Promise<void> {
    const file = await this.findOne(id);
    
    if (file.userId !== userId) {
      throw new NotFoundException('无权删除此文件');
    }

    await this.qiniuService.deleteFile(file.key);
    await this.fileRepository.remove(file);
  }

  getUploadToken(): string {
    return this.qiniuService.getUploadToken();
  }
} 