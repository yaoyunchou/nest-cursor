/*
 * @Author: yaoyc yaoyunchou@bananain.com
 * @Date: 2025-01-18 10:00:44
 * @LastEditors: yaoyc yaoyunchou@bananain.com
 * @LastEditTime: 2025-01-18 10:00:44
 * @FilePath: \nest-cursor\src\modules\creation\services\coze.service.ts
 * @Description: Coze服务 - 封装Coze API调用
 */
import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import * as FormData from 'form-data';
import {
  CozeAuthRequest,
  CozeAuthResponse,
  CozeFileUploadResponse,
  CozeWorkflowRunRequest,
  CozeWorkflowRunResponse,
  CozeWorkflowStatusResponse,
  CozeErrorResponse,
  CozeConfig,
} from '../interfaces/coze.interface';

@Injectable()
export class CozeService {
  private readonly logger = new Logger(CozeService.name);
  private readonly httpClient: AxiosInstance;
  private readonly config: CozeConfig;
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor(private readonly configService: ConfigService) {
    // 从环境变量获取配置
    this.config = {
      baseUrl: this.configService.get<string>('COZE_BASE_URL', 'https://api.coze.cn'),
      apiKey: this.configService.get<string>('COZE_API_KEY'),
      defaultWorkflowId: this.configService.get<string>('COZE_DEFAULT_WORKFLOW_ID'),
      timeout: this.configService.get<number>('COZE_TIMEOUT', 30000),
    };

    if (!this.config.apiKey) {
      throw new Error('COZE_API_KEY环境变量未配置');
    }

    // 创建HTTP客户端
    this.httpClient = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 设置请求拦截器
    this.httpClient.interceptors.request.use(
      (config) => {
        this.logger.debug(`发送请求: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        this.logger.error('请求拦截器错误:', error);
        return Promise.reject(error);
      },
    );

    // 设置响应拦截器
    this.httpClient.interceptors.response.use(
      (response) => {
        this.logger.debug(`收到响应: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        this.logger.error('响应拦截器错误:', error.response?.data || error.message);
        return Promise.reject(error);
      },
    );
  }

  /**
   * 获取访问令牌
   * @param durationSeconds - 令牌有效期（秒）
   * @returns 访问令牌
   */
  async getAccessToken(durationSeconds: number = 86399): Promise<string> {
    // 检查是否有有效的令牌
    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      return this.accessToken;
    }

    try {
      const authRequest: CozeAuthRequest = {
        duration_seconds: durationSeconds,
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      };

      const response: AxiosResponse<CozeAuthResponse> = await this.httpClient.post(
        '/api/permission/oauth2/token',
        authRequest,
        {
          headers: {
            Authorization: `Bearer ${this.config.apiKey}`,
          },
        },
      );

      const { access_token, expires_in } = response.data;
      
      // 缓存令牌和过期时间
      this.accessToken = access_token;
      this.tokenExpiresAt = Date.now() + (expires_in - 60) * 1000; // 提前60秒过期

      this.logger.log('成功获取Coze访问令牌');
      return access_token;
    } catch (error) {
      this.logger.error('获取Coze访问令牌失败:', error.response?.data || error.message);
      throw new InternalServerErrorException('获取Coze访问令牌失败');
    }
  }

  /**
   * 上传文件到Coze
   * @param fileBuffer - 文件缓冲区
   * @param fileName - 文件名
   * @param fileType - 文件类型
   * @returns 文件上传响应
   */
  async uploadFile(
    fileBuffer: Buffer,
    fileName: string,
    fileType: string,
  ): Promise<CozeFileUploadResponse> {
    try {
      const accessToken = await this.getAccessToken();
      
      // 创建FormData
      const formData = new FormData();
      formData.append('file', fileBuffer, {
        filename: fileName,
        contentType: fileType,
      });

      const response: AxiosResponse<CozeFileUploadResponse> = await this.httpClient.post(
        '/v1/files/upload',
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      this.logger.log(`文件上传成功: ${fileName}`);
      return response.data;
    } catch (error) {
      this.logger.error('上传文件到Coze失败:', error.response?.data || error.message);
      throw new InternalServerErrorException('上传文件失败');
    }
  }

  /**
   * 运行工作流
   * @param workflowId - 工作流ID
   * @param parameters - 工作流参数
   * @param isAsync - 是否异步执行
   * @returns 工作流运行响应
   */
  async runWorkflow(
    workflowId: string,
    parameters: Record<string, any>,
    isAsync: boolean = false,
  ): Promise<CozeWorkflowRunResponse> {
    try {
      const accessToken = await this.getAccessToken();
      
      const workflowRequest: CozeWorkflowRunRequest = {
        workflow_id: workflowId,
        parameters,
        is_async: isAsync,
      };

      const response: AxiosResponse<CozeWorkflowRunResponse> = await this.httpClient.post(
        '/v1/workflow/run',
        workflowRequest,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      this.logger.log(`工作流运行成功: ${workflowId}`);
      return response.data;
    } catch (error) {
      this.logger.error('运行Coze工作流失败:', error.response?.data || error.message);
      throw new InternalServerErrorException('运行工作流失败');
    }
  }

  /**
   * 查询工作流执行状态
   * @param executeId - 执行ID
   * @returns 工作流状态响应
   */
  async getWorkflowStatus(executeId: string): Promise<CozeWorkflowStatusResponse> {
    try {
      const accessToken = await this.getAccessToken();

      const response: AxiosResponse<CozeWorkflowStatusResponse> = await this.httpClient.get(
        `/v1/workflow/run/${executeId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      return response.data;
    } catch (error) {
      this.logger.error('查询工作流状态失败:', error.response?.data || error.message);
      throw new InternalServerErrorException('查询工作流状态失败');
    }
  }

  /**
   * 等待工作流执行完成
   * @param executeId - 执行ID
   * @param maxWaitTime - 最大等待时间（毫秒）
   * @param pollInterval - 轮询间隔（毫秒）
   * @returns 最终的工作流状态响应
   */
  async waitForWorkflowCompletion(
    executeId: string,
    maxWaitTime: number = 300000, // 默认5分钟
    pollInterval: number = 2000, // 默认2秒
  ): Promise<CozeWorkflowStatusResponse> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      const status = await this.getWorkflowStatus(executeId);
      
      if (status.status === 'success' || status.status === 'failed') {
        return status;
      }
      
      // 等待下次轮询
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
    
    throw new InternalServerErrorException('工作流执行超时');
  }

  /**
   * 运行默认工作流（如果配置了默认工作流ID）
   * @param parameters - 工作流参数
   * @param isAsync - 是否异步执行
   * @returns 工作流运行响应
   */
  async runDefaultWorkflow(
    parameters: Record<string, any>,
    isAsync: boolean = false,
  ): Promise<CozeWorkflowRunResponse> {
    if (!this.config.defaultWorkflowId) {
      throw new BadRequestException('未配置默认工作流ID');
    }
    
    return this.runWorkflow(this.config.defaultWorkflowId, parameters, isAsync);
  }

  /**
   * 创建图片生成任务
   * @param prompt - 提示词
   * @param additionalParams - 额外参数
   * @returns 工作流运行响应
   */
  async generateImage(
    prompt: string,
    additionalParams: Record<string, any> = {},
  ): Promise<CozeWorkflowRunResponse> {
    const parameters = {
      prompt,
      ...additionalParams,
    };

    if (this.config.defaultWorkflowId) {
      return this.runDefaultWorkflow(parameters);
    } else {
      throw new BadRequestException('未配置图片生成工作流ID');
    }
  }

  /**
   * 获取服务健康状态
   * @returns 服务配置信息（不包含敏感信息）
   */
  getServiceInfo(): Record<string, any> {
    return {
      baseUrl: this.config.baseUrl,
      hasApiKey: !!this.config.apiKey,
      hasDefaultWorkflowId: !!this.config.defaultWorkflowId,
      timeout: this.config.timeout,
      hasValidToken: this.accessToken && Date.now() < this.tokenExpiresAt,
    };
  }

  /**
   * 处理Coze API错误
   * @param error - 错误对象
   * @returns 格式化的错误信息
   */
  private handleCozeError(error: any): string {
    if (error.response?.data?.error) {
      const cozeError: CozeErrorResponse = error.response.data;
      return `Coze API错误: ${cozeError.error.message} (${cozeError.error.code})`;
    }
    
    return error.message || '未知错误';
  }
} 