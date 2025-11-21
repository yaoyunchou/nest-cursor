/*
 * @Description: 微信小程序订阅消息通知方法测试
 */
import axios from 'axios';
import { sendWechatMiniNotification, WechatMiniNotificationData, WechatMiniNotificationResult } from './wechat-mini.notifier';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// 暂时跳过微信小程序测试，等待appid申请
describe.skip('sendWechatMiniNotification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('成功场景', () => {
    it('应该成功发送微信小程序订阅消息', async () => {
      // 安排
      const data: WechatMiniNotificationData = {
        appId: 'test-app-id',
        appSecret: 'test-app-secret',
        openid: 'test-openid',
        templateId: 'test-template-id',
        page: 'pages/index/index',
        data: {
          thing1: '测试标题',
          thing2: '测试内容',
        },
      };

      const mockAccessTokenResponse = {
        data: {
          access_token: 'test-access-token',
          expires_in: 7200,
        },
      };

      const mockSendMessageResponse = {
        data: {
          errcode: 0,
          errmsg: 'ok',
          msgid: 'test-msg-id',
        },
      };

      mockedAxios.get.mockResolvedValueOnce(mockAccessTokenResponse);
      mockedAxios.post.mockResolvedValueOnce(mockSendMessageResponse);

      // 行动
      const actualResult = await sendWechatMiniNotification(data);

      // 断言
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=test-app-id&secret=test-app-secret',
      );
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=test-access-token',
        {
          touser: 'test-openid',
          template_id: 'test-template-id',
          page: 'pages/index/index',
          data: {
            thing1: { value: '测试标题' },
            thing2: { value: '测试内容' },
          },
        },
      );
      expect(actualResult).toEqual({
        success: true,
        message: '微信小程序订阅消息发送成功',
        data: mockSendMessageResponse.data,
      });
    });

    it('应该成功发送不带page参数的消息', async () => {
      // 安排
      const data: WechatMiniNotificationData = {
        appId: 'test-app-id',
        appSecret: 'test-app-secret',
        openid: 'test-openid',
        templateId: 'test-template-id',
        data: {
          thing1: '测试标题',
        },
      };

      const mockAccessTokenResponse = {
        data: {
          access_token: 'test-access-token',
          expires_in: 7200,
        },
      };

      const mockSendMessageResponse = {
        data: {
          errcode: 0,
          errmsg: 'ok',
        },
      };

      mockedAxios.get.mockResolvedValueOnce(mockAccessTokenResponse);
      mockedAxios.post.mockResolvedValueOnce(mockSendMessageResponse);

      // 行动
      const actualResult = await sendWechatMiniNotification(data);

      // 断言
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.not.objectContaining({
          page: expect.anything(),
        }),
      );
      expect(actualResult.success).toBe(true);
    });

    it('应该正确格式化模板数据', async () => {
      // 安排
      const data: WechatMiniNotificationData = {
        appId: 'test-app-id',
        appSecret: 'test-app-secret',
        openid: 'test-openid',
        templateId: 'test-template-id',
        data: {
          number1: 123,
          number2: 456.78,
          thing3: true,
          thing4: null,
        },
      };

      const mockAccessTokenResponse = {
        data: {
          access_token: 'test-access-token',
          expires_in: 7200,
        },
      };

      const mockSendMessageResponse = {
        data: {
          errcode: 0,
          errmsg: 'ok',
        },
      };

      mockedAxios.get.mockResolvedValueOnce(mockAccessTokenResponse);
      mockedAxios.post.mockResolvedValueOnce(mockSendMessageResponse);

      // 行动
      await sendWechatMiniNotification(data);

      // 断言
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          data: {
            number1: { value: '123' },
            number2: { value: '456.78' },
            thing3: { value: 'true' },
            thing4: { value: 'null' },
          },
        }),
      );
    });
  });

  describe('错误场景', () => {
    it('应该在获取access_token失败时返回错误', async () => {
      // 安排
      const data: WechatMiniNotificationData = {
        appId: 'test-app-id',
        appSecret: 'test-app-secret',
        openid: 'test-openid',
        templateId: 'test-template-id',
        data: {},
      };

      const mockErrorResponse = {
        data: {
          errcode: 40013,
          errmsg: 'invalid appid',
        },
      };

      mockedAxios.get.mockResolvedValueOnce(mockErrorResponse);

      // 行动
      const actualResult = await sendWechatMiniNotification(data);

      // 断言
      expect(actualResult.success).toBe(false);
      expect(actualResult.message).toContain('获取微信access_token失败');
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });

    it('应该在发送消息失败时返回错误', async () => {
      // 安排
      const data: WechatMiniNotificationData = {
        appId: 'test-app-id',
        appSecret: 'test-app-secret',
        openid: 'test-openid',
        templateId: 'test-template-id',
        data: {},
      };

      const mockAccessTokenResponse = {
        data: {
          access_token: 'test-access-token',
          expires_in: 7200,
        },
      };

      const mockErrorResponse = {
        data: {
          errcode: 40037,
          errmsg: 'invalid template_id',
        },
      };

      mockedAxios.get.mockResolvedValueOnce(mockAccessTokenResponse);
      mockedAxios.post.mockResolvedValueOnce(mockErrorResponse);

      // 行动
      const actualResult = await sendWechatMiniNotification(data);

      // 断言
      expect(actualResult.success).toBe(false);
      expect(actualResult.message).toContain('微信小程序订阅消息发送失败');
      expect(actualResult.data).toEqual(mockErrorResponse.data);
    });

    it('应该在网络错误时返回错误', async () => {
      // 安排
      const data: WechatMiniNotificationData = {
        appId: 'test-app-id',
        appSecret: 'test-app-secret',
        openid: 'test-openid',
        templateId: 'test-template-id',
        data: {},
      };

      const mockError = new Error('Network Error');
      mockedAxios.get.mockRejectedValueOnce(mockError);

      // 行动
      const actualResult = await sendWechatMiniNotification(data);

      // 断言
      expect(actualResult.success).toBe(false);
      expect(actualResult.message).toBe('Network Error');
      expect(actualResult.data).toBeNull();
    });

    it('应该在axios响应错误时返回错误信息', async () => {
      // 安排
      const data: WechatMiniNotificationData = {
        appId: 'test-app-id',
        appSecret: 'test-app-secret',
        openid: 'test-openid',
        templateId: 'test-template-id',
        data: {},
      };

      const mockError = {
        message: 'Request failed',
        response: {
          data: {
            error: 'Internal Server Error',
          },
        },
      };
      mockedAxios.get.mockRejectedValueOnce(mockError);

      // 行动
      const actualResult = await sendWechatMiniNotification(data);

      // 断言
      expect(actualResult.success).toBe(false);
      expect(actualResult.message).toBe('Request failed');
      expect(actualResult.data).toEqual(mockError.response.data);
    });
  });
});

