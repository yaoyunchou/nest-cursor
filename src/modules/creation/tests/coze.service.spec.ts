/*
 * @Author: yaoyc yaoyunchou@bananain.com
 * @Date: 2025-01-18 10:00:44
 * @LastEditors: yaoyc yaoyunchou@bananain.com
 * @LastEditTime: 2025-01-18 10:00:44
 * @FilePath: \nest-cursor\src\modules\creation\tests\coze.service.spec.ts
 * @Description: Coze服务测试
 */
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { CozeService } from '../services/coze.service';
import { InternalServerErrorException, BadRequestException } from '@nestjs/common';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('CozeService', () => {
  let service: CozeService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockAxiosInstance = {
    post: jest.fn(),
    get: jest.fn(),
    interceptors: {
      request: {
        use: jest.fn(),
      },
      response: {
        use: jest.fn(),
      },
    },
  };

  beforeEach(async () => {
    // 先设置mock配置，再创建模块
    mockConfigService.get.mockImplementation((key: string, defaultValue?: any) => {
      const config = {
        COZE_BASE_URL: 'https://api.coze.cn',
        COZE_API_KEY: 'test_api_key',
        COZE_DEFAULT_WORKFLOW_ID: 'test_workflow_id',
        COZE_TIMEOUT: 30000,
      };
      return config[key] || defaultValue;
    });

    // Mock axios.create to return our mock instance
    mockedAxios.create.mockReturnValue(mockAxiosInstance as any);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CozeService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<CozeService>(CozeService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('构造函数', () => {
    it('应该正确初始化配置', () => {
      expect(mockConfigService.get).toHaveBeenCalledWith('COZE_BASE_URL', 'https://api.coze.cn');
      expect(mockConfigService.get).toHaveBeenCalledWith('COZE_API_KEY');
      expect(mockConfigService.get).toHaveBeenCalledWith('COZE_DEFAULT_WORKFLOW_ID');
      expect(mockConfigService.get).toHaveBeenCalledWith('COZE_TIMEOUT', 30000);
    });

    it('应该在没有API_KEY时抛出错误', () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'COZE_API_KEY') return undefined;
        return 'default_value';
      });

      expect(() => {
        new CozeService(mockConfigService as any);
      }).toThrow('COZE_API_KEY环境变量未配置');
    });
  });

  describe('getAccessToken', () => {
    it('应该成功获取访问令牌', async () => {
      // 安排
      const mockTokenResponse = {
        data: {
          access_token: 'test_access_token',
          token_type: 'Bearer',
          expires_in: 3600,
        },
      };

      mockAxiosInstance.post.mockResolvedValue(mockTokenResponse);

      // 行动
      const actualToken = await service.getAccessToken();

      // 断言
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/api/permission/oauth2/token',
        {
          duration_seconds: 86399,
          grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        },
        {
          headers: {
            Authorization: 'Bearer test_api_key',
          },
        },
      );
      expect(actualToken).toBe('test_access_token');
    });

    it('应该缓存有效的访问令牌', async () => {
      // 安排
      const mockTokenResponse = {
        data: {
          access_token: 'cached_token',
          token_type: 'Bearer',
          expires_in: 3600,
        },
      };

      mockAxiosInstance.post.mockResolvedValue(mockTokenResponse);

      // 行动 - 第一次调用
      const firstToken = await service.getAccessToken();
      
      // 行动 - 第二次调用
      const secondToken = await service.getAccessToken();

      // 断言
      expect(mockAxiosInstance.post).toHaveBeenCalledTimes(1);
      expect(firstToken).toBe(secondToken);
    });

    it('应该在API调用失败时抛出异常', async () => {
      // 安排
      const mockError = {
        response: {
          data: { error: 'Unauthorized' },
        },
        message: 'Request failed',
      };

      mockAxiosInstance.post.mockRejectedValue(mockError);

      // 行动 & 断言
      await expect(service.getAccessToken()).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('runWorkflow', () => {
    it('应该成功运行工作流', async () => {
      // 安排
      const workflowId = 'test_workflow';
      const parameters = { prompt: '测试提示词' };
      const mockTokenResponse = {
        data: { access_token: 'test_token', expires_in: 3600 },
      };
      const mockWorkflowResponse = {
        data: {
          execute_id: 'exec_123',
          data: { images: ['image1.jpg'] },
          cost_tokens: 100,
          token: 'response_token',
        },
      };

      mockAxiosInstance.post
        .mockResolvedValueOnce(mockTokenResponse) // 获取token
        .mockResolvedValueOnce(mockWorkflowResponse); // 运行工作流

      // 行动
      const actualResult = await service.runWorkflow(workflowId, parameters);

      // 断言
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/v1/workflow/run',
        {
          workflow_id: workflowId,
          parameters,
          is_async: false,
        },
        {
          headers: {
            Authorization: 'Bearer test_token',
          },
        },
      );
      expect(actualResult).toEqual(mockWorkflowResponse.data);
    });
  });

  describe('generateImage', () => {
    it('应该成功生成图片', async () => {
      // 安排
      const prompt = '画一只可爱的小猫';
      const additionalParams = { style: 'cartoon' };
      const mockTokenResponse = {
        data: { access_token: 'test_token', expires_in: 3600 },
      };
      const mockWorkflowResponse = {
        data: {
          execute_id: 'exec_123',
          data: { images: ['cat_image.jpg'] },
          cost_tokens: 150,
          token: 'response_token',
        },
      };

      mockAxiosInstance.post
        .mockResolvedValueOnce(mockTokenResponse)
        .mockResolvedValueOnce(mockWorkflowResponse);

      // 行动
      const actualResult = await service.generateImage(prompt, additionalParams);

      // 断言
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/v1/workflow/run',
        {
          workflow_id: 'test_workflow_id',
          parameters: { prompt, style: 'cartoon' },
          is_async: false,
        },
        {
          headers: {
            Authorization: 'Bearer test_token',
          },
        },
      );
      expect(actualResult).toEqual(mockWorkflowResponse.data);
    });

    it('应该在没有默认工作流ID时抛出异常', async () => {
      // 安排
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'COZE_DEFAULT_WORKFLOW_ID') return undefined;
        return 'default_value';
      });

      // 重新创建服务实例
      const newService = new CozeService(mockConfigService as any);

      // 行动 & 断言
      await expect(newService.generateImage('test prompt')).rejects.toThrow(BadRequestException);
    });
  });

  describe('getServiceInfo', () => {
    it('应该返回服务配置信息', () => {
      // 行动
      const actualInfo = service.getServiceInfo();

      // 断言
      expect(actualInfo).toEqual({
        baseUrl: 'https://api.coze.cn',
        hasApiKey: true,
        hasDefaultWorkflowId: true,
        timeout: 30000,
        hasValidToken: false, // 初始状态没有token
      });
    });
  });

  it('应该被定义', () => {
    expect(service).toBeDefined();
  });
}); 