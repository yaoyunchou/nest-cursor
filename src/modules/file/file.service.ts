/*
 * @Author: yaoyc yaoyunchou@bananain.com
 * @Date: 2025-01-18 10:00:44
 * @LastEditors: yaoyc yaoyunchou@bananain.com
 * @LastEditTime: 2025-01-18 10:00:44
 * @FilePath: \nest-cursor\src\modules\file\file.service.ts
 * @Description: 文件服务
 */
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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

  /**
   * 上传并合并音频文件（支持1到多个文件）
   * @param files - 音频文件对象数组（1-21个）
   * @param userId - 上传用户ID
   * @returns 上传或合并后的文件实体
   */
  async uploadAndMergeAudio(
    files: Express.Multer.File[],
    userId: number,
  ): Promise<File> {
    // 验证文件数量
    if (!files || files.length === 0) {
      throw new BadRequestException('至少需要上传1个音频文件');
    }
    if (files.length > 21) {
      throw new BadRequestException('最多只能上传21个音频文件');
    }
    // 验证文件类型
    const audioMimeTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/aac'];
    for (const file of files) {
      if (!audioMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException(`文件 ${file.originalname} 不是支持的音频格式`);
      }
    }
    // 如果只有1个文件，直接上传返回，不进行合并
    if (files.length === 1) {
      return await this.upload(files[0], userId);
    }
    // 上传多个文件到七牛云
    const uploadedFiles: File[] = [];
    for (const file of files) {
      const uploadedFile = await this.upload(file, userId);
      uploadedFiles.push(uploadedFile);
    }
    // 生成合并后的文件名
    const random = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const outputKey = `coze/merged/${Date.now()}-${random}.mp3`;
    // 获取源文件的key数组
    const sourceKeys = uploadedFiles.map((f) => f.key);
    // 调用七牛云合并接口
    const persistentId = await this.qiniuService.concatAudio(sourceKeys, outputKey, 'mp3');
    // 轮询等待合并完成
    let mergedUrl: string | null = null;
    const maxRetries = 30; // 最多重试30次
    const retryInterval = 2000; // 每次间隔2秒
    for (let i = 0; i < maxRetries; i++) {
      try {
        const status = await this.qiniuService.getPersistentStatus(persistentId);
        if (status.code === 0) {
          // 合并成功
          mergedUrl = this.qiniuService.getFileUrl(outputKey);
          break;
        } else if (status.code === 1) {
          // 处理中，等待后继续
          if (i < maxRetries - 1) {
            await new Promise((resolve) => setTimeout(resolve, retryInterval));
          }
          continue;
        } else {
          // 处理失败 (code === 2 或 3)
          let errorMessage = status.description || '未知错误';
          if (status.items && status.items.length > 0) {
            const itemErrors = status.items
              .filter((item: any) => item.code !== 0)
              .map((item: any) => item.desc || item.error || '处理失败')
              .join('; ');
            if (itemErrors) {
              errorMessage = `${errorMessage}。详细信息: ${itemErrors}`;
            }
          }
          throw new Error(`音频合并失败: ${errorMessage}`);
        }
      } catch (error) {
        if (i === maxRetries - 1) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          throw new BadRequestException(`音频合并超时或失败: ${errorMessage}`);
        }
        if (error instanceof Error && error.message.includes('音频合并失败')) {
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, retryInterval));
      }
    }
    if (!mergedUrl) {
      throw new BadRequestException('音频合并超时，请稍后重试');
    }
    // 计算合并后文件的总大小（估算）
    const totalSize = uploadedFiles.reduce((sum, f) => sum + f.size, 0);
    // 创建合并后的文件实体
    const mergedFileEntity = this.fileRepository.create({
      filename: `merged-${Date.now()}.mp3`,
      originalname: `merged-audio-${Date.now()}.mp3`,
      size: totalSize,
      mimetype: 'audio/mpeg',
      url: mergedUrl,
      key: outputKey,
      userId,
    });
    // 保存合并后的文件信息到数据库
    return await this.fileRepository.save(mergedFileEntity);
  }

  /**
   * 通过七牛云URL合并音频文件（支持2到21个文件）
   * @param urls - 七牛云音频文件URL数组（2-21个）
   * @param userId - 用户ID
   * @returns 合并后的文件实体
   */
  async mergeAudioByUrls(urls: string[], userId: number): Promise<File> {
    // 验证URL数量
    if (!urls || urls.length < 2) {
      throw new BadRequestException('至少需要2个音频文件URL');
    }
    if (urls.length > 21) {
      throw new BadRequestException('最多只能合并21个音频文件');
    }
    // 从URL中提取key
    const sourceKeys: string[] = [];
    for (const url of urls) {
      const key = this.qiniuService.extractKeyFromUrl(url);
      if (!key) {
        throw new BadRequestException(`无效的七牛云URL: ${url}，无法提取文件key`);
      }
      sourceKeys.push(key);
    }
    // 验证所有key是否有效（非空且不包含特殊字符）
    for (let i = 0; i < sourceKeys.length; i++) {
      const key = sourceKeys[i];
      if (!key || key.trim().length === 0) {
        throw new BadRequestException(`第${i + 1}个URL提取的key为空: ${urls[i]}`);
      }
      if (key.includes('\n') || key.includes('\r')) {
        throw new BadRequestException(`第${i + 1}个URL提取的key包含非法字符: ${key}`);
      }
    }
    // 验证源文件是否存在（可选，如果文件不存在会导致合并失败）
    for (let i = 0; i < sourceKeys.length; i++) {
      const key = sourceKeys[i];
      const exists = await this.qiniuService.checkFileExists(key);
      if (!exists) {
        throw new BadRequestException(`第${i + 1}个文件不存在于七牛云存储空间: ${key} (URL: ${urls[i]})`);
      }
    }
    // 生成合并后的文件名
    const random = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const outputKey = `coze/merged/${Date.now()}-${random}.mpeg`;
    // 调用七牛云合并接口
    const persistentId = await this.qiniuService.concatAudio(sourceKeys, outputKey, 'mpeg');
    // 轮询等待合并完成
    let mergedUrl: string | null = null;
    const maxRetries = 30; // 最多重试30次
    const retryInterval = 2000; // 每次间隔2秒
    for (let i = 0; i < maxRetries; i++) {
      try {
        const status = await this.qiniuService.getPersistentStatus(persistentId);
        if (status.code === 0) {
          // 合并成功
          mergedUrl = this.qiniuService.getFileUrl(outputKey);
          break;
        } else if (status.code === 1) {
          // 处理中，等待后继续
          if (i < maxRetries - 1) {
            await new Promise((resolve) => setTimeout(resolve, retryInterval));
          }
          continue;
        } else {
          // 处理失败 (code === 2 或 3)
          let errorMessage = status.description || '未知错误';
          if (status.items && status.items.length > 0) {
            const itemErrors = status.items
              .filter((item: any) => item.code !== 0)
              .map((item: any) => item.desc || item.error || '处理失败')
              .join('; ');
            if (itemErrors) {
              errorMessage = `${errorMessage}。详细信息: ${itemErrors}`;
            }
          }
          throw new Error(`音频合并失败: ${errorMessage}`);
        }
      } catch (error) {
        if (i === maxRetries - 1) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          throw new BadRequestException(`音频合并超时或失败: ${errorMessage}`);
        }
        if (error instanceof Error && error.message.includes('音频合并失败')) {
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, retryInterval));
      }
    }
    if (!mergedUrl) {
      throw new BadRequestException('音频合并超时，请稍后重试');
    }
    // 创建合并后的文件实体（大小设为0，因为无法准确计算）
    const mergedFileEntity = this.fileRepository.create({
      filename: `merged-${Date.now()}.mp3`,
      originalname: `merged-audio-${Date.now()}.mp3`,
      size: 0, // 无法准确计算合并后的大小
      mimetype: 'audio/mpeg',
      url: mergedUrl,
      key: outputKey,
      userId,
    });
    // 保存合并后的文件信息到数据库
    return await this.fileRepository.save(mergedFileEntity);
  }
} 