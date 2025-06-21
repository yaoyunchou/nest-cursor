/*
 * @Author: yaoyc yaoyunchou@bananain.com
 * @Date: 2025-01-18 10:00:44
 * @LastEditors: yaoyc yaoyunchou@bananain.com
 * @LastEditTime: 2025-01-18 10:00:44
 * @FilePath: \nest-cursor\src\modules\creation\creation.controller.ts
 * @Description: 创作控制器
 */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  ConflictException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery, ApiConsumes, ApiBody, ApiExcludeEndpoint } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreationService } from './creation.service';
import { CozeService } from './services/coze.service';
import { CreateCreationDto } from './dto/create-creation.dto';
import { UpdateCreationDto } from './dto/update-creation.dto';
import { QueryCreationDto } from './dto/query-creation.dto';
import { QueryCollectionDto } from './dto/query-collection.dto';
import { CozeGenerateImageDto, CozeWorkflowRunDto } from './dto/coze-generate.dto';
import { Creation } from './entities/creation.entity';
import { UserCollection } from './entities/user-collection.entity';
import { PaginatedResponse } from '../../shared/interfaces/pagination.interface';
import {
  CozeWorkflowRunResponse,
  CozeWorkflowStatusResponse,
  CozeFileUploadResponse,
} from './interfaces/coze.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator'
import { UploadFileDto } from '../file/dto/upload-file.dto';
import { CurrentUser } from '../userAction/user-action.controller';
import { User } from '../user/entities/user.entity';
import { userInfo } from 'os';

@ApiTags('创作管理')
@Controller('creations')
@UseGuards(JwtAuthGuard)
export class CreationController {
  constructor(
    private readonly creationService: CreationService,
    private readonly cozeService: CozeService,
  ) {}

  /**
   * 创建作品
   */
  @Post()
  @ApiOperation({ summary: '创建作品' })
  @ApiResponse({ status: 201, description: '作品创建成功', type: Creation })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  // @UseGuards(JwtAuthGuard) // 需要登录
  // @ApiBearerAuth()
  async create(
    @Body() createCreationDto: CreateCreationDto,
    @CurrentUser() user: User, // 临时处理，实际应该从JWT中获取用户信息
  ): Promise<Creation> {
    // 临时使用固定用户ID，实际应该从JWT token中获取
    const userId = user?.id || 1;
    return this.creationService.create(createCreationDto, userId);
  }

  /**
   * 创建作品（内部接口，不展示在Swagger）
   */
  @Post('internal-create')
  @Public()
  @ApiExcludeEndpoint()
  async internalCreate(
    @Body() createCreationDto: CreateCreationDto,
  ): Promise<Creation> {
    // 使用固定的用户ID
    const userId = 14;
    return this.creationService.create(createCreationDto, userId);
  }

  /**
   * 分页查询作品列表
   * 这个不需要权限认证
   */
  @Public()
  @Get()
  @ApiOperation({ summary: '分页查询作品列表' })
  @ApiResponse({ status: 200, description: '查询成功', type: [Creation] })
  async findAll(
    @Query() query: QueryCollectionDto,
    @CurrentUser() user: User, // 临时处理，实际应该从JWT中获取用户信息
  ): Promise<PaginatedResponse<Creation>> {
    const currentUserId = user?.id;
    return this.creationService.findAll(query, currentUserId);
  }

  /**
   * 获取公开作品广场列表
   */
  @Public()
  @Get('public')
  @ApiOperation({ summary: '获取公开作品广场列表' })
  @ApiResponse({ status: 200, description: '查询成功', type: [Creation] })
  async findPublicCreations(
    @Query() query: QueryCollectionDto,
  ): Promise<PaginatedResponse<Creation>> {
    // 将参数转为number 类型
    query.page = Number(query.page) || 0 ;
    query.pageSize = Number(query.pageSize) || 10;
    return this.creationService.findPublicCreations(query);
  }

  /**
   * 获取作品详情
   */
  @Public()
  @Get(':id')
  @ApiOperation({ summary: '获取作品详情' })
  @ApiParam({ name: 'id', description: '作品ID', type: 'number' })
  @ApiResponse({ status: 200, description: '查询成功', type: Creation })
  @ApiResponse({ status: 404, description: '作品不存在' })
  @ApiResponse({ status: 403, description: '无权查看此作品' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User, // 临时处理，实际应该从JWT中获取用户信息
  ): Promise<Creation> {
    const currentUserId = user?.id;
    return this.creationService.findOne(id, currentUserId);
  }

  /**
   * 更新作品信息
   */
  @Patch(':id')
  @ApiOperation({ summary: '更新作品信息' })
  @ApiParam({ name: 'id', description: '作品ID', type: 'number' })
  @ApiResponse({ status: 200, description: '更新成功', type: Creation })
  @ApiResponse({ status: 404, description: '作品不存在' })
  @ApiResponse({ status: 403, description: '无权修改此作品' })
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCreationDto: UpdateCreationDto,
    @CurrentUser() user: User, // 临时处理，实际应该从JWT中获取用户信息
  ): Promise<Creation> {
    const userId = user?.id || 1;
    return this.creationService.update(id, updateCreationDto, userId);
  }

  /**
   * 删除作品
   */
  @Delete(':id')
  @ApiOperation({ summary: '删除作品' })
  @ApiParam({ name: 'id', description: '作品ID', type: 'number' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '作品不存在' })
  @ApiResponse({ status: 403, description: '无权删除此作品' })
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User, // 临时处理，实际应该从JWT中获取用户信息
  ): Promise<{ message: string }> {
    const userId = user?.id || 1;
    await this.creationService.remove(id, userId);
    return { message: '作品删除成功' };
  }

  /**
   * 切换作品公开状态
   */
  @Post(':id/toggle-public')
  @ApiOperation({ summary: '切换作品公开状态' })
  @ApiParam({ name: 'id', description: '作品ID', type: 'number' })
  @ApiResponse({ status: 200, description: '状态切换成功', type: Creation })
  @ApiResponse({ status: 404, description: '作品不存在' })
  @ApiResponse({ status: 403, description: '无权修改此作品' })
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
  async togglePublic(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User, // 临时处理，实际应该从JWT中获取用户信息
  ): Promise<Creation> {
    const userId = user?.id || 1;
    return this.creationService.togglePublic(id, userId);
  }

  /**
   * 点赞作品
   */
  @Post(':id/like')
  @ApiOperation({ summary: '点赞作品' })
  @ApiParam({ name: 'id', description: '作品ID', type: 'number' })
  @ApiResponse({ status: 200, description: '点赞成功', type: Creation })
  @ApiResponse({ status: 404, description: '作品不存在' })
  @ApiResponse({ status: 403, description: '无权点赞此作品' })
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
  async likeCreation(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User, // 临时处理，实际应该从JWT中获取用户信息
  ): Promise<Creation> {
    const userId = user?.id || 1;
    return this.creationService.likeCreation(id, userId);
  }

  /**
   * 取消点赞作品
   */
  @Post(':id/unlike')
  @ApiOperation({ summary: '取消点赞作品' })
  @ApiParam({ name: 'id', description: '作品ID', type: 'number' })
  @ApiResponse({ status: 200, description: '取消点赞成功', type: Creation })
  @ApiResponse({ status: 404, description: '作品不存在' })
  @ApiResponse({ status: 403, description: '无权操作此作品' })
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
  async unlikeCreation(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User, // 临时处理，实际应该从JWT中获取用户信息
  ): Promise<Creation> {
    const userId = user?.id || 1;
    return this.creationService.unlikeCreation(id, userId);
  }

  /**
   * 收藏作品
   */
  @Post(':id/collect')
  @ApiOperation({ summary: '收藏作品' })
  @ApiParam({ name: 'id', description: '作品ID', type: 'number' })
  @ApiResponse({ status: 201, description: '收藏成功', type: UserCollection })
  @ApiResponse({ status: 404, description: '作品不存在' })
  @ApiResponse({ status: 403, description: '无权收藏此作品' })
  @ApiResponse({ status: 409, description: '已经收藏过此作品' })
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
  async collectCreation(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ): Promise<UserCollection> {
    const userId = user?.id || 1;
    return this.creationService.collectCreation(id, userId);
  }

  /**
   * 取消收藏作品
   */
  @Delete(':id/uncollect')
  @ApiOperation({ summary: '取消收藏作品' })
  @ApiParam({ name: 'id', description: '作品ID', type: 'number' })
  @ApiResponse({ status: 200, description: '取消收藏成功' })
  @ApiResponse({ status: 404, description: '作品不存在或未收藏' })
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
  async uncollectCreation(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ): Promise<{ message: string }> {
    const userId = user?.id || 1;
    await this.creationService.uncollectCreation(id, userId);
    return { message: '取消收藏成功' };
  }

  /**
   * 获取用户收藏列表
   */
  @Get('users/personal/collections')
  @ApiOperation({ summary: '获取用户收藏列表' })
  @ApiParam({ name: 'userId', description: '用户ID', type: 'number' })
  @ApiResponse({ status: 200, description: '查询成功', type: [UserCollection] })
  async getUserCollections(
    @Query() query: QueryCollectionDto,
    @CurrentUser() user: User,
  ): Promise<PaginatedResponse<UserCollection>> {
    const userId = user?.id || 1;
    return this.creationService.getUserCollections(userId, query);
  }

  // ================== Coze API 相关接口 ==================

  /**
   * 使用Coze生成图片
   */
  @Post('coze/generate-image')
  @ApiOperation({ summary: '使用Coze生成图片' })
  @ApiResponse({ status: 201, description: '图片生成请求成功', type: Object })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 500, description: 'Coze服务错误' })
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
  async generateImage(
    @Body() cozeGenerateDto: CozeGenerateImageDto,
  ): Promise<CozeWorkflowRunResponse> {
    const { prompt, workflowId, isAsync, additionalParams } = cozeGenerateDto;
    
    if (workflowId) {
      return this.cozeService.runWorkflow(workflowId, { prompt, ...additionalParams }, isAsync);
    } else {
      return this.cozeService.generateImage(prompt, additionalParams);
    }
  }

  /**
   * 运行Coze工作流
   */
  @Post('coze/run-workflow')
  @ApiOperation({ summary: '运行Coze工作流' })
  @ApiResponse({ status: 201, description: '工作流运行成功', type: Object })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 500, description: 'Coze服务错误' })
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
  async runWorkflow(
    @Body() workflowDto: CozeWorkflowRunDto,
  ): Promise<CozeWorkflowRunResponse> {
    const { workflowId, parameters, isAsync } = workflowDto;
    return this.cozeService.runWorkflow(workflowId, parameters, isAsync);
  }

  /**
   * 查询工作流执行状态
   */
  @Get('coze/workflow-status/:executeId')
  @ApiOperation({ summary: '查询工作流执行状态' })
  @ApiParam({ name: 'executeId', description: '执行ID', type: 'string' })
  @ApiResponse({ status: 200, description: '查询成功', type: Object })
  @ApiResponse({ status: 404, description: '执行记录不存在' })
  async getWorkflowStatus(
    @Query() queryObjects,
    @Param('executeId') executeId: string,
  ): Promise<CozeWorkflowStatusResponse> {
    const { workflow_id} = queryObjects
    return this.cozeService.getWorkflowStatus(workflow_id, executeId);
  }

  /**
   * 上传文件到Coze
   */
  @Post('coze/upload-file')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({type: UploadFileDto})
  @ApiOperation({ summary: '上传文件到Coze' })
  @ApiResponse({ status: 201, description: '文件上传成功', type: Object })
  @ApiResponse({ status: 400, description: '文件参数错误' })
  @ApiResponse({ status: 500, description: 'Coze服务错误' })
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
  @Public()
  async uploadFileToCoze(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<CozeFileUploadResponse> {
    if (!file) {
      throw new Error('请选择要上传的文件');
    }
    
    return this.cozeService.uploadFile(file.buffer, file.originalname, file.mimetype);
  }

  /**
   * 获取Coze服务状态
   */
  @Get('coze/service-info')
  @ApiOperation({ summary: '获取Coze服务状态' })
  @ApiResponse({ status: 200, description: '查询成功', type: Object })
  async getCozeServiceInfo(): Promise<Record<string, any>> {
    return this.cozeService.getServiceInfo();
  }

  /**
   * 管理员测试接口
   */
  @Get('admin/test')
  @ApiOperation({ summary: '管理员测试接口' })
  @ApiResponse({ status: 200, description: '测试成功' })
  async adminTest(): Promise<{ message: string; timestamp: string }> {
    return {
      message: 'Creation模块运行正常',
      timestamp: new Date().toISOString(),
    };
    
  }
} 