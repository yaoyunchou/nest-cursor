import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LowcodeService } from './lowcode.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { PublishPageDto } from './dto/publish-page.dto';
import { Page } from './entities/page.entity';

@ApiTags('低代码页面管理')
@Controller('lowcode')
export class LowcodeController {
  constructor(private readonly lowcodeService: LowcodeService) {}

  @Post()
  @ApiOperation({ summary: '创建页面' })
  @ApiResponse({ status: 201, type: Page })
  create(@Body() createPageDto: CreatePageDto) {
    return this.lowcodeService.create(createPageDto);
  }

  @Get()
  @ApiOperation({ summary: '获取所有页面' })
  @ApiResponse({ status: 200, type: [Page] })
  findAll() {
    return this.lowcodeService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取指定页面' })
  @ApiResponse({ status: 200, type: Page })
  findOne(@Param('id') id: string) {
    return this.lowcodeService.findOne(+id);
  }

  @Get(':id/published')
  @ApiOperation({ summary: '获取已发布的页面版本' })
  @ApiResponse({ status: 200, type: Page })
  getPublishedVersion(@Param('id') id: string) {
    return this.lowcodeService.getPublishedVersion(+id);
  }

  @Get(':id/history')
  @ApiOperation({ summary: '获取页面版本历史' })
  @ApiResponse({ status: 200, type: [Page] })
  getVersionHistory(@Param('id') id: string) {
    return this.lowcodeService.getVersionHistory(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新页面' })
  @ApiResponse({ status: 200, type: Page })
  update(@Param('id') id: string, @Body() updatePageDto: UpdatePageDto) {
    return this.lowcodeService.update(+id, updatePageDto);
  }

  @Put(':id/publish')
  @ApiOperation({ summary: '发布页面' })
  @ApiResponse({ status: 200, type: Page })
  publish(@Param('id') id: string, @Body() publishDto: PublishPageDto) {
    return this.lowcodeService.publish(+id, publishDto);
  }

  @Put(':id/offline')
  @ApiOperation({ summary: '下线页面' })
  @ApiResponse({ status: 200, type: Page })
  offline(@Param('id') id: string) {
    return this.lowcodeService.offline(+id);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除页面' })
  @ApiResponse({ status: 200 })
  remove(@Param('id') id: string) {
    return this.lowcodeService.remove(+id);
  }

  @Put(':id/rollback/:versionId')
  @ApiOperation({ summary: '回滚到指定版本' })
  @ApiResponse({ status: 200, type: Page })
  rollback(
    @Param('id') id: string,
    @Param('versionId') versionId: string,
  ) {
    return this.lowcodeService.rollback(+id, +versionId);
  }
} 