/*
 * @Description: 飞书通知方法测试
 */
import axios from 'axios';
import { sendFeishuNotification, FeishuNotificationData, FeishuNotificationResult } from './feishu.notifier';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('sendFeishuNotification', () => {
  const originalEnv = { ...process.env };
  let originalFeishuAppId: string | undefined;
  let originalFeishuAppSecret: string | undefined;

  beforeEach(() => {
    jest.clearAllMocks();
    // 保存原始环境变量（可能来自 .env 文件）
    originalFeishuAppId = process.env.FEISHU_APP_ID;
    originalFeishuAppSecret = process.env.FEISHU_APP_SECRET;
    // 设置测试环境变量（测试使用固定的测试值，确保测试结果可预测）
    // 注意：如果 .env 文件中有值，这里会被覆盖，但测试仍然使用 mock 的返回值
    process.env.FEISHU_APP_ID = process.env.FEISHU_APP_ID || 'test-app-id';
    process.env.FEISHU_APP_SECRET = process.env.FEISHU_APP_SECRET || 'test-app-secret';
  });

  afterEach(() => {
    // 恢复原始环境变量（包括从 .env 文件加载的值）
    if (originalFeishuAppId !== undefined) {
      process.env.FEISHU_APP_ID = originalFeishuAppId;
    } else {
      delete process.env.FEISHU_APP_ID;
    }
    if (originalFeishuAppSecret !== undefined) {
      process.env.FEISHU_APP_SECRET = originalFeishuAppSecret;
    } else {
      delete process.env.FEISHU_APP_SECRET;
    }
  });

  describe('成功场景', () => {
    it('应该成功发送飞书通知', async () => {
      // 安排
      const data: FeishuNotificationData = {
        userId: '01848',
        content: {
          title: '测试标题',
          text: '测试内容',
        },
      };

      const mockAccessTokenResponse = {
        data: {
          code: 0,
          tenant_access_token: 'test-access-token',
        },
      };

      const mockSendMessageResponse = {
        data: {
          code: 0,
          msg: 'success',
          data: {
            message_id: 'test-message-id',
          },
        },
      };

      mockedAxios.post
        .mockResolvedValueOnce(mockAccessTokenResponse)
        .mockResolvedValueOnce(mockSendMessageResponse);

      // 行动
      const actualResult = await sendFeishuNotification(data);

      // 断言
      expect(mockedAxios.post).toHaveBeenCalledTimes(2);
      expect(mockedAxios.post).toHaveBeenNthCalledWith(
        1,
        'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal',
        {
          app_id: process.env.FEISHU_APP_ID || 'test-app-id',
          app_secret: process.env.FEISHU_APP_SECRET || 'test-app-secret',
        },
      );
      expect(actualResult).toEqual({
        success: true,
        message: '飞书通知发送成功',
        data: mockSendMessageResponse.data,
      });
    });

    it('应该成功发送只有文本内容的通知', async () => {
      // 安排
      const data: FeishuNotificationData = {
        appId: 'test-app-id',
        appSecret: 'test-app-secret',
        userId: 'test-user-id',
        content: {
          text: '测试内容',
        },
      };

      const mockAccessTokenResponse = {
        data: {
          code: 0,
          tenant_access_token: 'test-access-token',
        },
      };

      const mockSendMessageResponse = {
        data: {
          code: 0,
          msg: 'success',
        },
      };

      mockedAxios.post
        .mockResolvedValueOnce(mockAccessTokenResponse)
        .mockResolvedValueOnce(mockSendMessageResponse);

      // 行动
      const actualResult = await sendFeishuNotification(data);

      // 断言
      expect(mockedAxios.post).toHaveBeenCalledTimes(2);
      expect(mockedAxios.post).toHaveBeenNthCalledWith(
        2,
        'https://open.feishu.cn/open-apis/im/v1/messages',
        expect.objectContaining({
          content: JSON.stringify({
            text: '测试内容',
          }),
        }),
        expect.any(Object),
      );
      expect(actualResult.success).toBe(true);
    });

    it('应该成功发送只有标题的通知', async () => {
      // 安排
      const data: FeishuNotificationData = {
        appId: 'test-app-id',
        appSecret: 'test-app-secret',
        userId: 'test-user-id',
        content: {
          title: '测试标题',
        },
      };

      const mockAccessTokenResponse = {
        data: {
          code: 0,
          tenant_access_token: 'test-access-token',
        },
      };

      const mockSendMessageResponse = {
        data: {
          code: 0,
          msg: 'success',
        },
      };

      mockedAxios.post
        .mockResolvedValueOnce(mockAccessTokenResponse)
        .mockResolvedValueOnce(mockSendMessageResponse);

      // 行动
      const actualResult = await sendFeishuNotification(data);

      // 断言
      expect(actualResult.success).toBe(true);
      expect(mockedAxios.post).toHaveBeenNthCalledWith(
        2,
        'https://open.feishu.cn/open-apis/im/v1/messages',
        expect.objectContaining({
          content: JSON.stringify({
            text: '测试标题\n',
          }),
        }),
        expect.any(Object),
      );
    });
  });

  describe('错误场景', () => {
    it('应该在获取access_token失败时返回错误', async () => {
      // 安排
      const data: FeishuNotificationData = {
        appId: 'test-app-id',
        appSecret: 'test-app-secret',
        userId: 'test-user-id',
        content: {
          text: '测试内容',
        },
      };

      const mockErrorResponse = {
        data: {
          code: 9999,
          msg: 'invalid app_id',
        },
      };

      mockedAxios.post.mockResolvedValueOnce(mockErrorResponse);

      // 行动
      const actualResult = await sendFeishuNotification(data);

      // 断言
      expect(actualResult.success).toBe(false);
      expect(actualResult.message).toContain('获取飞书access_token失败');
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });

    it('应该在发送消息失败时返回错误', async () => {
      // 安排
      const data: FeishuNotificationData = {
        appId: 'test-app-id',
        appSecret: 'test-app-secret',
        userId: 'test-user-id',
        content: {
          text: '测试内容',
        },
      };

      const mockAccessTokenResponse = {
        data: {
          code: 0,
          tenant_access_token: 'test-access-token',
        },
      };

      const mockErrorResponse = {
        data: {
          code: 9999,
          msg: 'invalid user_id',
        },
      };

      mockedAxios.post
        .mockResolvedValueOnce(mockAccessTokenResponse)
        .mockResolvedValueOnce(mockErrorResponse);

      // 行动
      const actualResult = await sendFeishuNotification(data);

      // 断言
      expect(actualResult.success).toBe(false);
      expect(actualResult.message).toContain('飞书通知发送失败');
      expect(actualResult.data).toEqual(mockErrorResponse.data);
    });

    it('应该在环境变量和参数都未配置时返回错误', async () => {
      // 安排 - 临时清除环境变量
      const originalAppId = process.env.FEISHU_APP_ID;
      const originalAppSecret = process.env.FEISHU_APP_SECRET;
      delete process.env.FEISHU_APP_ID;
      delete process.env.FEISHU_APP_SECRET;

      const data: FeishuNotificationData = {
        userId: 'test-user-id',
        content: {
          text: '测试内容',
        },
      };

      // 行动
      const actualResult = await sendFeishuNotification(data);

      // 断言
      expect(actualResult.success).toBe(false);
      expect(actualResult.message).toBe('飞书应用ID和密钥未配置');

      // 恢复环境变量
      if (originalAppId) process.env.FEISHU_APP_ID = originalAppId;
      if (originalAppSecret) process.env.FEISHU_APP_SECRET = originalAppSecret;
    });

    it('应该优先使用传入的参数而不是环境变量', async () => {
      // 安排
      const data: FeishuNotificationData = {
        appId: 'custom-app-id',
        appSecret: 'custom-app-secret',
        userId: 'test-user-id',
        content: {
          text: '测试内容',
        },
      };

      const mockAccessTokenResponse = {
        data: {
          code: 0,
          tenant_access_token: 'test-access-token',
        },
      };

      const mockSendMessageResponse = {
        data: {
          code: 0,
          msg: 'success',
        },
      };

      mockedAxios.post
        .mockResolvedValueOnce(mockAccessTokenResponse)
        .mockResolvedValueOnce(mockSendMessageResponse);

      // 行动
      await sendFeishuNotification(data);

      // 断言 - 应该使用传入的参数，而不是环境变量
      expect(mockedAxios.post).toHaveBeenNthCalledWith(
        1,
        'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal',
        {
          app_id: 'custom-app-id',
          app_secret: 'custom-app-secret',
        },
      );
    });

    it('应该在网络错误时返回错误', async () => {
      // 安排
      const data: FeishuNotificationData = {
        appId: 'test-app-id',
        appSecret: 'test-app-secret',
        userId: 'test-user-id',
        content: {
          text: '测试内容',
        },
      };

      const mockError = new Error('Network Error');
      mockedAxios.post.mockRejectedValueOnce(mockError);

      // 行动
      const actualResult = await sendFeishuNotification(data);

      // 断言
      expect(actualResult.success).toBe(false);
      expect(actualResult.message).toBe('Network Error');
      expect(actualResult.data).toBeNull();
    });

    it('应该在axios响应错误时返回错误信息', async () => {
      // 安排
      const data: FeishuNotificationData = {
        appId: 'test-app-id',
        appSecret: 'test-app-secret',
        userId: 'test-user-id',
        content: {
          text: '测试内容',
        },
      };

      const mockError = {
        message: 'Request failed',
        response: {
          data: {
            error: 'Internal Server Error',
          },
        },
      };
      mockedAxios.post.mockRejectedValueOnce(mockError);

      // 行动
      const actualResult = await sendFeishuNotification(data);

      // 断言
      expect(actualResult.success).toBe(false);
      expect(actualResult.message).toBe('Request failed');
      expect(actualResult.data).toEqual(mockError.response.data);
    });
  });
});

