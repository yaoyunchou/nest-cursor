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
  CozeFileUploadResponse,
  CozeWorkflowRunRequest,
  CozeWorkflowRunResponse,
  CozeWorkflowStatusResponse,
  CozeErrorResponse,
  CozeConfig,
} from '../interfaces/coze.interface';
import { getJWTToken } from '@coze/api';
import { getCozeOutput } from '../utils';

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
      client_type: "jwt",
      client_id:this.configService.get<string>('COZE_CLIENT_ID'),
      coze_www_base: "https://www.coze.cn",
      coze_api_base: "https://api.coze.cn",
      private_key: this.configService.get<string>('COZE_PRIVATE_KEY'),
      defaultWorkflowId: this.configService.get<string>('COZE_DEFAULT_WORKFLOW_ID'),
      public_key_id: this.configService.get<string>('COZE_PUBLIC_KEY_ID'),
      timeout: 30000,
    };

    if (!this.config.private_key) {
      throw new Error('COZE_API_KEY环境变量未配置');
    }

    // 创建HTTP客户端
    this.httpClient = axios.create({
      baseURL: this.config.coze_api_base ,
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
  async getAccessToken(): Promise<string> {
    // 检查是否有有效的令牌
    if (this.accessToken && Date.now() < this.tokenExpiresAt *1000) {
      return this.accessToken;
    }

    try {
      let jwtToken = await getJWTToken({
        baseURL: this.config.coze_api_base || 'https://api.coze.cn' ,
        appId: this.config.client_id,
        aud: new URL(this.config.coze_api_base || 'https://api.coze.cn').host,
        keyid: this.config.public_key_id,
        privateKey: this.config.private_key
      });
      this.accessToken  = jwtToken.access_token
      this.tokenExpiresAt = jwtToken.expires_in * 1000 + Date.now()
      console.log('getJWTToken', jwtToken);
     
      return jwtToken.access_token;
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
  async getWorkflowStatus(workflow_id: string , executeId: string): Promise<CozeWorkflowStatusResponse> {
    try {
      const accessToken = await this.getAccessToken();
      
        //   /v1/workflows/{{workflow_id}}/run_histories/{{execute_id}}
      const response: AxiosResponse<CozeWorkflowStatusResponse> = await this.httpClient.get(
        `/v1/workflows/${workflow_id}/run_histories/${executeId}`,    
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      const backData =  response.data.data[0];
      // 处理输出的内容
      backData.images= getCozeOutput(backData.output)
      return backData;
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
    workflow_id:string,
    executeId: string,
    maxWaitTime: number = 300000, // 默认5分钟
    pollInterval: number = 2000, // 默认2秒
  ): Promise<CozeWorkflowStatusResponse> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      const status = await this.getWorkflowStatus(workflow_id, executeId);
      
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
      baseUrl: this.config.coze_api_base,
      hasApiKey: !!this.config.private_key,
      hasDefaultWorkflowId: !!this.config.defaultWorkflowId,
      timeout: this.config.timeout,
      hasValidToken: !!(this.accessToken && Date.now() < this.tokenExpiresAt),
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