import { Controller, Get, Post, Body, Put, Delete, Param, Query } from '@nestjs/common';
import { DictionaryService } from './dictionary.service';
import { CreateDictionaryDto } from './dto/create-dictionary.dto';
import { UpdateDictionaryDto } from './dto/update-dictionary.dto';
import { QueryDictionaryDto } from './dto/query-dictionary.dto';
import { Dictionary } from './entities/dictionary.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery, ApiParam, ApiOkResponse, ApiExtraModels, getSchemaPath } from '@nestjs/swagger';
import { ListResponse } from '@/models/list-response.model';
import { Public } from '@/modules/auth/decorators/public.decorator';

/**
 * 字典控制器
 */
@ApiTags('字典管理')
@ApiExtraModels(Dictionary)
@Controller('dictionary')
@Public()
export class DictionaryController {
  constructor(private readonly dictionaryService: DictionaryService) {}

  /** 创建字典 */
  @Post()
  @ApiOperation({ summary: '创建字典' })
  @ApiBody({ type: CreateDictionaryDto, description: '字典参数' })
  @ApiOkResponse({ description: '创建成功', type: Dictionary })
  async create(@Body() dto: CreateDictionaryDto): Promise<Dictionary> {
    return this.dictionaryService.create(dto);
  }

  /** 批量创建字典 */
  @Post('batch')
  @ApiOperation({ summary: '批量创建字典' })
  @ApiBody({ type: [CreateDictionaryDto], description: '字典参数数组' })
  @ApiOkResponse({ description: '批量创建成功', type: [Dictionary] })
  async createBatch(@Body() dtos: CreateDictionaryDto[]): Promise<Dictionary[]> {
    return this.dictionaryService.createBatch(dtos);
  }

  /** 分页查询字典 */
  @Get()
  @ApiOperation({ summary: '分页查询字典' })
  @ApiQuery({ name: 'page', required: false, description: '当前页码' })
  @ApiQuery({ name: 'pageSize', required: false, description: '每页条数' })
  @ApiQuery({ name: 'category', required: false, description: '字典分类' })
  @ApiQuery({ name: 'name', required: false, description: '字典名称' })
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
          items: { $ref: getSchemaPath(Dictionary) },
          description: '字典列表',
        },
      },
    },
  })
  async findAll(@Query() query: QueryDictionaryDto): Promise<ListResponse<Dictionary>> {
    return this.dictionaryService.findAll(query);
  }

  /** 根据分类获取字典列表 */
  @Get('category/:category')
  @ApiOperation({ summary: '根据分类获取字典列表' })
  @ApiParam({ name: 'category', description: '字典分类' })
  @ApiOkResponse({ description: '查询成功', type: [Dictionary] })
  async findByCategory(@Param('category') category: string): Promise<Dictionary[]> {
    return this.dictionaryService.findByCategory(category);
  }

  /** 根据分类和名称获取字典 */
  @Get('category/:category/name/:name')
  @ApiOperation({ summary: '根据分类和名称获取字典' })
  @ApiParam({ name: 'category', description: '字典分类' })
  @ApiParam({ name: 'name', description: '字典名称' })
  @ApiOkResponse({ description: '查询成功', type: Dictionary })
  async findByCategoryAndName(
    @Param('category') category: string,
    @Param('name') name: string,
  ): Promise<Dictionary | null> {
    return this.dictionaryService.findByCategoryAndName(category, name);
  }

  /** 获取单个字典 */
  @Get(':id')
  @ApiOperation({ summary: '获取单个字典' })
  @ApiParam({ name: 'id', description: '字典ID' })
  @ApiOkResponse({ description: '查询成功', type: Dictionary })
  async findOne(@Param('id') id: number): Promise<Dictionary | null> {
    return this.dictionaryService.findOne(id);
  }

  /** 更新字典 */
  @Put(':id')
  @ApiOperation({ summary: '更新字典' })
  @ApiParam({ name: 'id', description: '字典ID' })
  @ApiBody({ type: UpdateDictionaryDto, description: '更新参数' })
  @ApiOkResponse({ description: '更新成功', type: Dictionary })
  async update(@Param('id') id: number, @Body() dto: UpdateDictionaryDto): Promise<Dictionary | null> {
    return this.dictionaryService.update(id, dto);
  }

  /** 删除字典 */
  @Delete(':id')
  @ApiOperation({ summary: '删除字典' })
  @ApiParam({ name: 'id', description: '字典ID' })
  @ApiOkResponse({ description: '删除成功' })
  async remove(@Param('id') id: number): Promise<void> {
    return this.dictionaryService.remove(id);
  }

  /** 获取所有分类 */
  @Get('categories/list')
  @ApiOperation({ summary: '获取所有分类' })
  @ApiOkResponse({ description: '查询成功', type: [String] })
  async getCategories(): Promise<string[]> {
    return this.dictionaryService.getCategories();
  }
} 