/*
 * @Description: 飞书通知方法集成测试（真实 API 调用）
 * 注意：这个测试文件会真正调用飞书 API，需要有效的 appId 和 appSecret
 * 运行方式：npm test -- feishu.notifier.integration.spec.ts
 */
import { getFeishuAccessToken, sendFeishuNotification, FeishuNotificationData } from './feishu.notifier';

describe('飞书通知集成测试（真实 API）', () => {
  // 跳过测试，除非明确指定运行集成测试, 开关， 真实的数据测试
  const shouldRunIntegrationTests = false;

  beforeAll(() => {
    if (!shouldRunIntegrationTests) {
      console.log('跳过集成测试：设置 RUN_INTEGRATION_TESTS=true 来运行');
    }
    if (!process.env.FEISHU_APP_ID || !process.env.FEISHU_APP_SECRET) {
      console.warn('警告：环境变量 FEISHU_APP_ID 或 FEISHU_APP_SECRET 未配置');
    }
  });

  describe('getFeishuAccessToken', () => {
    it('应该成功获取 access_token', async () => {
      if (!shouldRunIntegrationTests) {
        return;
      }
      if (!process.env.FEISHU_APP_ID || !process.env.FEISHU_APP_SECRET) {
        console.warn('跳过测试：环境变量未配置');
        return;
      }
      const token = await getFeishuAccessToken(process.env.FEISHU_APP_ID, process.env.FEISHU_APP_SECRET);
      console.log('获取到的 token:', token);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    }, 10000); // 设置超时时间为 10 秒
  });

  describe('sendFeishuNotification', () => {
    it('应该成功发送飞书通知', async () => {
      if (!shouldRunIntegrationTests) {
        return;
      }
      if (!process.env.FEISHU_APP_ID || !process.env.FEISHU_APP_SECRET) {
        console.warn('跳过测试：环境变量未配置');
        return;
      }
      const data: FeishuNotificationData = {
        userId: process.env.FEISHU_TEST_USER_ID || '01848',
        content: {
          title: '集成测试标题',
          text: '这是一条集成测试消息',
        },
      };
      const result = await sendFeishuNotification(data);
      console.log('发送结果:', result);
      expect(result.success).toBe(true);
      expect(result.message).toBe('飞书通知发送成功');
    }, 15000); // 设置超时时间为 15 秒
  });
});

