/*
 * @Description: URL通知方法测试
 */
import axios from 'axios';
import { sendUrlNotification, UrlNotificationData, UrlNotificationResult } from './url.notifier';

jest.mock('axios');
const mockedAxios = axios as jest.MockedFunction<any>;

describe('sendUrlNotification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('成功场景', () => {
    it('应该成功发送POST请求', async () => {
      // 安排
      const data: UrlNotificationData = {
        url: 'https://example.com/webhook',
        method: 'POST',
        headers: {
          'X-Custom-Header': 'custom-value',
        },
        body: {
          message: '测试消息',
          timestamp: 1234567890,
        },
      };

      const mockResponse = {
        data: {
          success: true,
          message: 'received',
        },
      };

      mockedAxios.mockResolvedValueOnce(mockResponse);

      // 行动
      const actualResult = await sendUrlNotification(data);

      // 断言
      expect(mockedAxios).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://example.com/webhook',
        headers: {
          'Content-Type': 'application/json',
          'X-Custom-Header': 'custom-value',
        },
        data: {
          message: '测试消息',
          timestamp: 1234567890,
        },
      });
      expect(actualResult).toEqual({
        success: true,
        message: 'URL通知发送成功',
        data: mockResponse.data,
      });
    });

    it('应该成功发送GET请求', async () => {
      // 安排
      const data: UrlNotificationData = {
        url: 'https://example.com/api',
        method: 'GET',
        body: {
          id: '123',
          type: 'test',
        },
      };

      const mockResponse = {
        data: {
          result: 'success',
        },
      };

      mockedAxios.mockResolvedValueOnce(mockResponse);

      // 行动
      const actualResult = await sendUrlNotification(data);

      // 断言
      expect(mockedAxios).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://example.com/api',
        headers: {
          'Content-Type': 'application/json',
        },
        params: {
          id: '123',
          type: 'test',
        },
      });
      expect(actualResult.success).toBe(true);
    });

    it('应该成功发送PUT请求', async () => {
      // 安排
      const data: UrlNotificationData = {
        url: 'https://example.com/api/resource',
        method: 'PUT',
        body: {
          name: 'updated name',
        },
      };

      const mockResponse = {
        data: {
          success: true,
        },
      };

      mockedAxios.mockResolvedValueOnce(mockResponse);

      // 行动
      const actualResult = await sendUrlNotification(data);

      // 断言
      expect(mockedAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'PUT',
          data: {
            name: 'updated name',
          },
        }),
      );
      expect(actualResult.success).toBe(true);
    });

    it('应该成功发送DELETE请求', async () => {
      // 安排
      const data: UrlNotificationData = {
        url: 'https://example.com/api/resource/123',
        method: 'DELETE',
      };

      const mockResponse = {
        data: {
          success: true,
        },
      };

      mockedAxios.mockResolvedValueOnce(mockResponse);

      // 行动
      const actualResult = await sendUrlNotification(data);

      // 断言
      expect(mockedAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'DELETE',
        }),
      );
      expect(actualResult.success).toBe(true);
    });

    it('应该使用默认POST方法', async () => {
      // 安排
      const data: UrlNotificationData = {
        url: 'https://example.com/webhook',
        body: {
          message: '测试消息',
        },
      };

      const mockResponse = {
        data: {
          success: true,
        },
      };

      mockedAxios.mockResolvedValueOnce(mockResponse);

      // 行动
      await sendUrlNotification(data);

      // 断言
      expect(mockedAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
        }),
      );
    });
  });

  describe('模板变量替换', () => {
    it('应该替换URL中的模板变量', async () => {
      // 安排
      const data: UrlNotificationData = {
        url: 'https://example.com/api/{userId}/notify/{type}',
        method: 'POST',
        body: {
          message: '测试消息',
        },
      };

      const variables = {
        userId: '123',
        type: 'alert',
      };

      const mockResponse = {
        data: {
          success: true,
        },
      };

      mockedAxios.mockResolvedValueOnce(mockResponse);

      // 行动
      await sendUrlNotification(data, variables);

      // 断言
      expect(mockedAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://example.com/api/123/notify/alert',
        }),
      );
    });

    it('应该替换body中的模板变量', async () => {
      // 安排
      const data: UrlNotificationData = {
        url: 'https://example.com/webhook',
        method: 'POST',
        body: {
          userId: '{userId}',
          message: 'Hello {name}',
          timestamp: '{timestamp}',
        },
      };

      const variables = {
        userId: '123',
        name: 'John',
        timestamp: '1234567890',
      };

      const mockResponse = {
        data: {
          success: true,
        },
      };

      mockedAxios.mockResolvedValueOnce(mockResponse);

      // 行动
      await sendUrlNotification(data, variables);

      // 断言
      expect(mockedAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            userId: '123',
            message: 'Hello John',
            timestamp: '1234567890',
          },
        }),
      );
    });

    it('应该替换headers中的模板变量', async () => {
      // 安排
      const data: UrlNotificationData = {
        url: 'https://example.com/webhook',
        method: 'POST',
        headers: {
          'X-User-Id': '{userId}',
          'X-Api-Key': '{apiKey}',
        },
        body: {
          message: '测试消息',
        },
      };

      const variables = {
        userId: '123',
        apiKey: 'secret-key',
      };

      const mockResponse = {
        data: {
          success: true,
        },
      };

      mockedAxios.mockResolvedValueOnce(mockResponse);

      // 行动
      await sendUrlNotification(data, variables);

      // 断言
      expect(mockedAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-User-Id': '123',
            'X-Api-Key': 'secret-key',
          }),
        }),
      );
    });

    it('应该递归替换嵌套对象中的模板变量', async () => {
      // 安排
      const data: UrlNotificationData = {
        url: 'https://example.com/webhook',
        method: 'POST',
        body: {
          user: {
            id: '{userId}',
            name: '{userName}',
          },
          items: [
            { id: '{itemId1}', name: 'Item 1' },
            { id: '{itemId2}', name: 'Item 2' },
          ],
        },
      };

      const variables = {
        userId: '123',
        userName: 'John',
        itemId1: 'item-1',
        itemId2: 'item-2',
      };

      const mockResponse = {
        data: {
          success: true,
        },
      };

      mockedAxios.mockResolvedValueOnce(mockResponse);

      // 行动
      await sendUrlNotification(data, variables);

      // 断言
      expect(mockedAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            user: {
              id: '123',
              name: 'John',
            },
            items: [
              { id: 'item-1', name: 'Item 1' },
              { id: 'item-2', name: 'Item 2' },
            ],
          },
        }),
      );
    });

    it('应该在不提供变量时保持原始值', async () => {
      // 安排
      const data: UrlNotificationData = {
        url: 'https://example.com/api/{userId}',
        method: 'POST',
        body: {
          message: 'Hello {name}',
        },
      };

      const mockResponse = {
        data: {
          success: true,
        },
      };

      mockedAxios.mockResolvedValueOnce(mockResponse);

      // 行动
      await sendUrlNotification(data);

      // 断言
      expect(mockedAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://example.com/api/{userId}',
          data: {
            message: 'Hello {name}',
          },
        }),
      );
    });
  });

  describe('错误场景', () => {
    it('应该在网络错误时返回错误', async () => {
      // 安排
      const data: UrlNotificationData = {
        url: 'https://example.com/webhook',
        method: 'POST',
        body: {
          message: '测试消息',
        },
      };

      const mockError = new Error('Network Error');
      mockedAxios.mockRejectedValueOnce(mockError);

      // 行动
      const actualResult = await sendUrlNotification(data);

      // 断言
      expect(actualResult.success).toBe(false);
      expect(actualResult.message).toBe('Network Error');
      expect(actualResult.data).toBeNull();
    });

    it('应该在HTTP错误时返回错误信息', async () => {
      // 安排
      const data: UrlNotificationData = {
        url: 'https://example.com/webhook',
        method: 'POST',
        body: {
          message: '测试消息',
        },
      };

      const mockError = {
        message: 'Request failed with status code 500',
        response: {
          data: {
            error: 'Internal Server Error',
            code: 500,
          },
        },
      };
      mockedAxios.mockRejectedValueOnce(mockError);

      // 行动
      const actualResult = await sendUrlNotification(data);

      // 断言
      expect(actualResult.success).toBe(false);
      expect(actualResult.message).toBe('Request failed with status code 500');
      expect(actualResult.data).toEqual(mockError.response.data);
    });

    it('应该在超时时返回错误', async () => {
      // 安排
      const data: UrlNotificationData = {
        url: 'https://example.com/webhook',
        method: 'POST',
        body: {
          message: '测试消息',
        },
      };

      const mockError = {
        message: 'timeout of 5000ms exceeded',
        code: 'ECONNABORTED',
      };
      mockedAxios.mockRejectedValueOnce(mockError);

      // 行动
      const actualResult = await sendUrlNotification(data);

      // 断言
      expect(actualResult.success).toBe(false);
      expect(actualResult.message).toBe('timeout of 5000ms exceeded');
      expect(actualResult.data).toBeNull();
    });
  });
});

