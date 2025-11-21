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
import { getJWTToken } from '@coze/api';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock @coze/api
jest.mock('@coze/api', () => ({
  getJWTToken: jest.fn(),
}));
const mockedGetJWTToken = getJWTToken as jest.MockedFunction<typeof getJWTToken>;

describe('CozeService', () => {
  let service: CozeService;
  let configService: ConfigService;
  let mockConfigService: any;

  const createMockConfigService = () => ({
    get: jest.fn((key: string, defaultValue?: any) => {
      const config: Record<string, any> = {
        COZE_CLIENT_ID: 'test_client_id',
        COZE_PRIVATE_KEY: 'test_api_key',
        COZE_DEFAULT_WORKFLOW_ID: 'test_workflow_id',
        COZE_PUBLIC_KEY_ID: 'test_public_key_id',
        COZE_TIMEOUT: 30000,
      };
      return config[key] || defaultValue;
    }),
  });

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
    mockConfigService = createMockConfigService();

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
      expect(mockConfigService.get).toHaveBeenCalledWith('COZE_CLIENT_ID');
      expect(mockConfigService.get).toHaveBeenCalledWith('COZE_PRIVATE_KEY');
      expect(mockConfigService.get).toHaveBeenCalledWith('COZE_DEFAULT_WORKFLOW_ID');
      expect(mockConfigService.get).toHaveBeenCalledWith('COZE_PUBLIC_KEY_ID');
    });

    it('应该在没有API_KEY时抛出错误', () => {
      const mockConfigWithoutKey = createMockConfigService();
      mockConfigWithoutKey.get.mockImplementation((key: string) => {
        if (key === 'COZE_PRIVATE_KEY') return undefined;
        return 'default_value';
      });

      expect(() => {
        new CozeService(mockConfigWithoutKey as any);
      }).toThrow('COZE_API_KEY环境变量未配置');
    });
  });

  describe('getAccessToken', () => {
    it('应该成功获取访问令牌', async () => {
      // 安排
      const mockJWTTokenResponse = {
        access_token: 'test_access_token',
        expires_in: 3600, // 秒数
      };

      mockedGetJWTToken.mockResolvedValue(mockJWTTokenResponse);

      // 行动
      const actualToken = await service.getAccessToken();

      // 断言
      expect(mockedGetJWTToken).toHaveBeenCalledWith({
        baseURL: 'https://api.coze.cn',
        appId: 'test_client_id',
        aud: 'api.coze.cn',
        keyid: 'test_public_key_id',
        privateKey: 'test_api_key',
      });
      expect(actualToken).toBe('test_access_token');
    });

    it('应该缓存有效的访问令牌', async () => {
      // 安排
      const mockJWTTokenResponse = {
        access_token: 'cached_token',
        expires_in: 3600, // 秒数
      };

      mockedGetJWTToken.mockResolvedValue(mockJWTTokenResponse);

      // 行动 - 第一次调用
      const firstToken = await service.getAccessToken();
      
      // 行动 - 第二次调用
      const secondToken = await service.getAccessToken();

      // 断言
      expect(mockedGetJWTToken).toHaveBeenCalledTimes(1);
      expect(firstToken).toBe(secondToken);
    });

    it('应该在API调用失败时抛出异常', async () => {
      // 安排
      const mockError = new Error('获取JWT Token失败');

      mockedGetJWTToken.mockRejectedValue(mockError);

      // 行动 & 断言
      await expect(service.getAccessToken()).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('runWorkflow', () => {
    it('应该成功运行工作流', async () => {
      // 安排
      const workflowId = 'test_workflow';
      const parameters = { prompt: '测试提示词' };
      const mockJWTTokenResponse = {
        access_token: 'test_token',
        expires_in: 3600, // 秒数
      };
      const mockWorkflowResponse = {
        data: {
          execute_id: 'exec_123',
          data: { images: ['image1.jpg'] },
          cost_tokens: 100,
          token: 'response_token',
        },
      };

      mockedGetJWTToken.mockResolvedValue(mockJWTTokenResponse);
      mockAxiosInstance.post.mockResolvedValue(mockWorkflowResponse);

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
      const mockJWTTokenResponse = {
        access_token: 'test_token',
        expires_in: 3600, // 秒数
      };
      const mockWorkflowResponse = {
        data: {
          execute_id: 'exec_123',
          data: { images: ['cat_image.jpg'] },
          cost_tokens: 150,
          token: 'response_token',
        },
      };

      mockedGetJWTToken.mockResolvedValue(mockJWTTokenResponse);
      mockAxiosInstance.post.mockResolvedValue(mockWorkflowResponse);

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
      const mockConfigWithoutWorkflow = createMockConfigService();
      mockConfigWithoutWorkflow.get.mockImplementation((key: string) => {
        if (key === 'COZE_DEFAULT_WORKFLOW_ID') return undefined;
        if (key === 'COZE_PRIVATE_KEY') return 'test_api_key';
        return 'default_value';
      });

      // 重新创建服务实例
      const newService = new CozeService(mockConfigWithoutWorkflow as any);

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