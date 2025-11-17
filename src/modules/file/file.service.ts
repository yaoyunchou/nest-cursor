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

  /**
   * 上传文件到七牛云并保存文件信息
   * @param file - 上传的文件对象
   * @param userId - 上传用户ID
   * @returns 保存的文件实体
   */
  async upload(file: Express.Multer.File, userId: number): Promise<File> {
    // 生成唯一的文件名， 使用random
    const random = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const key = `coze/${Date.now()}-${random}.${file.mimetype.split('/')[1]}`;
    // 调用七牛云上传文件，进行上传
    const {url} = await this.qiniuService.uploadFile(file.buffer, key) ;

    // 创建文件实体
    const fileEntity = this.fileRepository.create({
      filename: file.originalname,
      originalname: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      url,
      key,
      userId,
    });

    // 保存文件信息到数据库
    return await this.fileRepository.save(fileEntity);
  }

  /**
   * 分页查询文件列表
   * @param query - 查询参数，包含文件名和文件类型
   * @returns 分页后的文件列表和总数
   */
  async findAll(query: QueryFileDto): Promise<PaginatedResponse<File>> {
    const { filename, mimetype } = query;
    
    // 创建查询构建器
    const queryBuilder = this.fileRepository.createQueryBuilder('file')
      .leftJoinAndSelect('file.user', 'user');

    // 根据文件名模糊查询
    if (filename) {
      queryBuilder.andWhere('file.filename LIKE :filename', { filename: `%${filename}%` });
    }

    // 根据文件类型精确查询
    if (mimetype) {
      queryBuilder.andWhere('file.mimetype = :mimetype', { mimetype });
    }

    // 执行查询并获取结果
    const [list, total] = await queryBuilder
      .getManyAndCount();

    return {
      list,
      total,
      pageSize: 0,
      pageIndex: 0,
    };
  }

  /**
   * 根据ID查询单个文件
   * @param id - 文件ID
   * @returns 文件实体
   * @throws NotFoundException 当文件不存在时抛出异常
   */
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

  /**
   * 删除文件
   * @param id - 文件ID
   * @param userId - 当前用户ID
   * @throws NotFoundException 当文件不存在或用户无权限时抛出异常
   */
  async remove(id: number, userId: number): Promise<void> {
    // 查询文件是否存在
    const file = await this.findOne(id);
    
    // 验证文件所有权
    if (file.userId !== userId) {
      throw new NotFoundException('无权删除此文件');
    }

    // 从七牛云删除文件
    await this.qiniuService.deleteFile(file.key);
    // 从数据库删除文件记录
    await this.fileRepository.remove(file);
  }

  /**
   * 获取七牛云上传凭证
   * @returns 上传凭证字符串
   */
  getUploadToken(): string {
    return this.qiniuService.getUploadToken();
  }
} 