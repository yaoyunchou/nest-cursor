import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, Not, In, MoreThan } from 'typeorm';
import { Page, PageStatus } from './entities/page.entity';
import { PageVersion } from './entities/page-version.entity';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { PublishPageDto } from './dto/publish-page.dto';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class LowcodeService {
  constructor(
    @InjectRepository(Page)
    private readonly pageRepository: Repository<Page>,
    @InjectRepository(PageVersion)
    private readonly versionRepository: Repository<PageVersion>,
  ) {}

  async create(createPageDto: CreatePageDto): Promise<Page> {
    const page = this.pageRepository.create({
      ...createPageDto,
      status: PageStatus.DRAFT,
      version: 1,
    });
    const savedPage = await this.pageRepository.save(page);

    // 创建第一个版本记录
    await this.createVersion(savedPage, PageStatus.DRAFT);
    
    return savedPage;
  }

  private async createVersion(page: Page, type: PageStatus, versionStr?: string, remark?: string): Promise<PageVersion> {
    const version = this.versionRepository.create({
      pageId: page.id,
      content: page.content,
      version: versionStr,
      remark,
    });
    return await this.versionRepository.save(version);
  }

  async findAll(): Promise<Page[]> {
    return await this.pageRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: number): Promise<Page> {
    const page = await this.pageRepository.findOne({ where: { id } });
    if (!page) {
      throw new NotFoundException(`页面ID ${id} 不存在`);
    }
    return page;
  }

  async update(id: number, updatePageDto: UpdatePageDto): Promise<Page> {
    const page = await this.findOne(id);
    
    // 更新版本号
    page.version += 1;
    
    const updatedPage = Object.assign(page, updatePageDto);
    const savedPage = await this.pageRepository.save(updatedPage);
    
    // 创建新的版本记录
    await this.createVersion(savedPage, PageStatus.DRAFT);
    
    return savedPage;
  }
  /**
   * 校验版本号是否递增
   * @param newVersion 新版本号
   * @param latestVersion 当前最新版本号
   */
   public compareVersion(newVersion: string, latestVersion: string): boolean {
    const parseVersion = (v: string) => v.split('.').map(Number);
    const newParts = parseVersion(newVersion);
    const latestParts = parseVersion(latestVersion);

    for (let i = 0; i < Math.max(newParts.length, latestParts.length); i++) {
      const newPart = newParts[i] || 0;
      const latestPart = latestParts[i] || 0;
      if (newPart > latestPart) return true;
      if (newPart < latestPart) return false;
    }
    return false;
  }

  /**
   * 发布页面
   * @param id 页面ID
   * @param publishDto 发布信息
   * @returns 发布后的页面
   * version 版本号  1.0.1
   * remark 发布说明
   */
  async publish(id: number, publishDto: PublishPageDto): Promise<Page> {
    const page = await this.findOne(id);
    // 获取最新的发布版本， createdAt 最大的一条数据
    const publishVersion =  await this.versionRepository.findOne({
      where: {
        pageId: id,
      },
      order: {
        createdAt: 'DESC',
      },
    });
    // 校验版本号是否递增
    if (!this.compareVersion(publishDto.version, publishVersion.version)) {
      throw new BadRequestException({
        code: 10005,
        message: '版本号必须递增, 当发布前版本号为：' + publishVersion.version + '， 新版本号为：' + publishDto.version
      });
    }

    page.status = PageStatus.PUBLISHED;
    const savedPage = await this.pageRepository.save(page);
    
    // 创建发布版本记录
    await this.createVersion(savedPage, PageStatus.PUBLISHED,publishDto.version, publishDto.remark);
    
    return savedPage;
  }

  async offline(id: number): Promise<Page> {
    const page = await this.findOne(id);
    
    if (page.status !== PageStatus.PUBLISHED) {
      throw new BadRequestException('只有已发布的页面可以下线');
    }

    page.status = PageStatus.OFFLINE;
    return await this.pageRepository.save(page);
  }

  async getPublishedVersion(id: number): Promise<Page> {
    const page = await this.findOne(id);
    
    if (page.status !== PageStatus.PUBLISHED) {
      throw new BadRequestException('页面未发布');
    }

    return {
      ...page,
      content: page.content, // 返回已发布的内容
    };
  }

  async getVersionHistory(id: number): Promise<PageVersion[]> {
    return await this.versionRepository.find({
      where: { pageId: id, isDeleted: false },
      order: { createdAt: 'DESC' },
    });
  }

  async rollback(id: number, versionId: number): Promise<Page> {
    const page = await this.findOne(id);
    const version = await this.versionRepository.findOne({ 
      where: { id: versionId, pageId: id } 
    });

    if (!version) {
      throw new NotFoundException('版本不存在');
    }

    // 回滚到指定版本
    page.content = version.content;
    // 将大于回滚版本的版本进行软删除， 回滚的当前版本不删除
    await this.versionRepository.update(
      { pageId: id, createdAt: MoreThan(version.createdAt), id: Not(versionId) },
      { isDeleted: true }
    );

    return await this.pageRepository.save(page);
  }

  async remove(id: number): Promise<void> {
    const page = await this.findOne(id);
    if (page.status === PageStatus.PUBLISHED) {
      throw new BadRequestException('已发布的页面不能删除');
    }
    await this.pageRepository.remove(page);
  }

  // 每天凌晨2点执行清理
  @Cron('0 0 2 * * *')
  async cleanupVersions() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 获取所有页面的最新20条版本记录
    const pages = await this.pageRepository.find();
    for (const page of pages) {
      const latestVersions = await this.versionRepository.find({
        where: { pageId: page.id },
        order: { createdAt: 'DESC' },
        take: 20,
      });

      // 保留这20条记录的ID
      const preserveIds = latestVersions.map(v => v.id);

      // 删除30天前的其他记录
      await this.versionRepository.delete({
        pageId: page.id,
        createdAt: LessThan(thirtyDaysAgo),
        id: Not(In(preserveIds)),
      });
    }
  }
} 