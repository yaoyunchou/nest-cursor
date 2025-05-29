import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LowcodeService } from './lowcode.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { PublishPageDto } from './dto/publish-page.dto';
import { Page } from './entities/page.entity';
import { PageCache } from './entities/page-cache.entity';

@ApiTags('Lowcode page Management')
@Controller('lowcode')
export class LowcodeController {
  constructor(private readonly lowcodeService: LowcodeService) {}

  @Post()
  @ApiOperation({ summary: 'createPage', description: '创建页面', operationId: 'createPage'})
  @ApiResponse({ status: 201, type: Page })
  create(@Body() createPageDto: CreatePageDto) {
    return this.lowcodeService.create(createPageDto);
  }

  @Get()
  @ApiOperation({ summary: 'findAllPage', description: '获取所有页面', operationId: 'findAllPage'})
  @ApiResponse({ status: 200, type: [Page] })
  findAll() {
    return this.lowcodeService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'findOnePage', description: '获取指定页面', operationId: 'findOnePage'})
  @ApiResponse({ status: 200, type: Page })
  findOne(@Param('id') id: string) {
    return this.lowcodeService.findOne(+id);
  }

  @Get(':id/published')
  @ApiOperation({ summary: 'getPublishedVersion', description: '获取已发布的页面版本', operationId: 'getPublishedVersion'})
  @ApiResponse({ status: 200, type: Page })
  getPublishedVersion(@Param('id') id: string) {
    return this.lowcodeService.getPublishedVersion(+id);
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'getVersionHistory', description: '获取页面版本历史', operationId: 'getVersionHistory'})
  @ApiResponse({ status: 200, type: [Page] })
  getVersionHistory(@Param('id') id: string) {
    return this.lowcodeService.getVersionHistory(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'updatePage', description: '更新页面', operationId: 'updatePage'})
  @ApiResponse({ status: 200, type: Page })
  update(@Param('id') id: string, @Body() updatePageDto: UpdatePageDto) {
    return this.lowcodeService.update(+id, updatePageDto);
  }

  @Put(':id/publish')
  @ApiOperation({ summary: 'publishPage', description: '发布页面', operationId: 'publishPage'})
  @ApiResponse({ status: 200, type: Page })
  publish(@Param('id') id: string, @Body() publishDto: PublishPageDto) {
    return this.lowcodeService.publish(+id, publishDto);
  }

  @Put(':id/offline')
  @ApiOperation({ summary: 'offlinePage', description: '下线页面', operationId: 'offlinePage'})
  @ApiResponse({ status: 200, type: Page })
  offline(@Param('id') id: string) {
    return this.lowcodeService.offline(+id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'deletePage', description: '删除页面', operationId: 'deletePage'})
  @ApiResponse({ status: 200 })
  remove(@Param('id') id: string) {
    return this.lowcodeService.remove(+id);
  }

  @Put(':id/rollback/:versionId')
  @ApiOperation({ summary: 'rollbackPage', description: ' 回滚到指定版本', operationId: 'rollbackPage'  })
  @ApiResponse({ status: 200, type: Page })
  rollback(
    @Param('id') id: string,
    @Param('versionId') versionId: string,
  ) {
    return this.lowcodeService.rollback(+id, +versionId);
  }

  @Get(':id/cache-history')
  @ApiOperation({ 
    summary: 'getPageCacheHistory', 
    description: '获取页面缓存历史', 
    operationId: 'getPageCacheHistory'
  })
  @ApiResponse({ status: 200, type: [PageCache] })
  getPageCacheHistory(@Param('id') id: string) {
    return this.lowcodeService.getPageCacheHistory(+id);
  }
} 