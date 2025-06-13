import { Controller, Post, Body, Get, Query, Param, Put, Delete, Patch } from '@nestjs/common';
import { FileResourceService } from './services/file-resource.service';
import { CreateFileResourceDto } from './dto/create-file-resource.dto';
import { UpdateFileResourceDto } from './dto/update-file-resource.dto';
import { QueryFileResourceDto } from './dto/query-file-resource.dto';
import { FileResource } from './entities/file-resource.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery, ApiParam, ApiOkResponse, ApiExtraModels, getSchemaPath } from '@nestjs/swagger';

/**
 * 图片资源接口
 */
@ApiTags('资源管理')
@ApiExtraModels(FileResource)
@Controller('file-resource')
export class FileResourceController {
  constructor(private readonly fileResourceService: FileResourceService) {}

  /** 创建图片资源 */
  @Post()
  @ApiOperation({ summary: '创建资源' })
  @ApiBody({ type: CreateFileResourceDto, description: '资源参数' })
  @ApiOkResponse({ description: '创建成功', type: FileResource })
  async create(@Body() dto: CreateFileResourceDto): Promise<FileResource> {
    return this.fileResourceService.createFileResource(dto);
  }

  /** 批量创建图片资源 */
  @Post('batch')
  @ApiOperation({ summary: '批量创建资源' })
  @ApiBody({ type: [CreateFileResourceDto], description: '资源参数数组' })
  @ApiOkResponse({ description: '批量创建成功', type: [FileResource] })
  async createBatch(@Body() dtos: CreateFileResourceDto[]): Promise<FileResource[]> {
    return this.fileResourceService.createFileResources(dtos);
  }

  /** 分页查询图片资源 */
  @Get()
  @ApiOperation({ summary: '分页查询资源' })
  @ApiQuery({ name: 'page', required: false, description: '当前页码' })
  @ApiQuery({ name: 'pageSize', required: false, description: '每页条数' })
  @ApiQuery({ name: 'origin', required: false, description: '图片来源' })
  @ApiQuery({ name: 'tags', required: false, description: '标签，多个用逗号分隔', type: String, isArray: true })
  @ApiQuery({ name: 'scene', required: false, description: '适用场景，多个用逗号分隔', type: String, isArray: true })
  @ApiQuery({ name: 'type', required: false, description: '图片类型/分类' })
  @ApiQuery({ name: 'weightMin', required: false, description: '权重下限' })
  @ApiQuery({ name: 'weightMax', required: false, description: '权重上限' })
  @ApiOkResponse({
    description: '查询成功',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number', description: '总条数' },
        page: { type: 'number', description: '当前页码' },
        pageSize: { type: 'number', description: '每页条数' },
        list: {
          type: 'array',
          items: { $ref: getSchemaPath(FileResource) },
          description: '资源列表',
        },
      },
    },
  })
  async findAll(@Query() query: QueryFileResourceDto): Promise<{ total: number; page: number; pageSize: number; list: FileResource[] }> {
    return this.fileResourceService.getFileResourceList(query);
  }

  /** 获取单个图片资源 */
  @Get(':id')
  @ApiOperation({ summary: '获取单个资源' })
  @ApiParam({ name: 'id', description: '资源ID' })
  @ApiOkResponse({ description: '查询成功', type: FileResource })
  async findOne(@Param('id') id: number): Promise<FileResource | null> {
    return this.fileResourceService.getFileResourceById(id);
  }

  /** 更新图片资源 */
  @Put(':id')
  @ApiOperation({ summary: '更新资源' })
  @ApiParam({ name: 'id', description: '资源ID' })
  @ApiBody({ type: UpdateFileResourceDto, description: '更新参数' })
  @ApiOkResponse({ description: '更新成功', type: FileResource })
  async update(@Param('id') id: number, @Body() dto: UpdateFileResourceDto): Promise<FileResource | null> {
    return this.fileResourceService.updateFileResource(id, dto);
  }

  /** 软删除图片资源 */
  @Delete(':id')
  @ApiOperation({ summary: '软删除资源' })
  @ApiParam({ name: 'id', description: '资源ID' })
  @ApiOkResponse({ description: '删除成功' })
  async remove(@Param('id') id: number): Promise<void> {
    return this.fileResourceService.deleteFileResource(id);
  }

  /** 恢复软删除的图片资源 */
  @Patch(':id/restore')
  @ApiOperation({ summary: '恢复软删除的资源' })
  @ApiParam({ name: 'id', description: '资源ID' })
  @ApiOkResponse({ description: '恢复成功' })
  async restore(@Param('id') id: number): Promise<void> {
    return this.fileResourceService.restoreFileResource(id);
  }

  /** 获取热门资源（按usageCount降序） */
  @Get('hot/list')
  @ApiOperation({ summary: '获取热门资源（按usageCount降序）' })
  @ApiQuery({ name: 'limit', required: false, description: '返回数量' })
  @ApiOkResponse({ description: '查询成功', type: [FileResource] })
  async getHotList(@Query('limit') limit?: number): Promise<FileResource[]> {
    return this.fileResourceService.getHotFileResources(limit);
  }
} 