/*
 * @Description: 通知服务测试
 */
import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { DictionaryService } from '../../dictionary/dictionary.service';
import { UserService } from '../../user/user.service';
import { NotificationTask, NotificationChannel } from '../entities/notification-task.entity';
import { sendFeishuNotification } from '../notifiers/feishu.notifier';
import { sendWechatMiniNotification } from '../notifiers/wechat-mini.notifier';
import { sendWechatMpNotification } from '../notifiers/wechat-mp.notifier';
import { sendUrlNotification } from '../notifiers/url.notifier';

jest.mock('../notifiers/feishu.notifier');
jest.mock('../notifiers/wechat-mini.notifier');
jest.mock('../notifiers/wechat-mp.notifier');
jest.mock('../notifiers/url.notifier');

describe('NotificationService', () => {
  let service: NotificationService;
  let dictionaryService: DictionaryService;
  let userService: UserService;

  const mockDictionaryService = {
    findByCategoryAndName: jest.fn(),
  };

  const mockUserService = {
    findOne: jest.fn(),
  };

  const mockFeishuRun = sendFeishuNotification as jest.MockedFunction<typeof sendFeishuNotification>;
  const mockWechatMiniRun = sendWechatMiniNotification as jest.MockedFunction<typeof sendWechatMiniNotification>;
  const mockWechatMpRun = sendWechatMpNotification as jest.MockedFunction<typeof sendWechatMpNotification>;
  const mockUrlRun = sendUrlNotification as jest.MockedFunction<typeof sendUrlNotification>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: DictionaryService,
          useValue: mockDictionaryService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    dictionaryService = module.get<DictionaryService>(DictionaryService);
    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('send', () => {
    const mockUser = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      phone: '13800138000',
      openid: 'test-openid',
    };

    it('应该成功发送飞书通知', async () => {
      // 安排
      const task = {
        id: 1,
        userId: 1,
        channel: NotificationChannel.FEISHU,
        channelConfig: {
          appId: 'test-app-id',
          appSecret: 'test-app-secret',
          userId: 'test-user-id',
        },
        content: {
          title: '测试标题',
          text: '测试内容',
        },
      } as unknown as NotificationTask;

      const expectedResult = {
        success: true,
        message: '飞书通知发送成功',
        data: {},
      };

      mockUserService.findOne.mockResolvedValue(mockUser);
      mockFeishuRun.mockResolvedValue(expectedResult);

      // 行动
      const actualResult = await service.send(task as unknown as NotificationTask);

      // 断言
      expect(mockUserService.findOne).toHaveBeenCalledWith(1);
      expect(mockFeishuRun).toHaveBeenCalledWith({
        appId: 'test-app-id',
        appSecret: 'test-app-secret',
        userId: 'test-user-id',
        content: {
          title: '测试标题',
          text: '测试内容',
        },
      });
      expect(actualResult).toEqual(expectedResult);
    });

    // 暂时跳过微信小程序测试，等待appid申请
    it.skip('应该成功发送微信小程序通知', async () => {
      // 安排
      const task = {
        id: 1,
        userId: 1,
        channel: NotificationChannel.WECHAT_MINI,
        channelConfig: {
          accountId: 'test-account-id',
          templateId: 'test-template-id',
          page: 'pages/index/index',
          data: {
            thing1: { value: '测试内容' },
          },
        },
        content: {
          title: '测试标题',
        },
      } as unknown as NotificationTask;

      const mockDictionary = {
        id: 1,
        category: 'wechat',
        name: 'wechat_mini_program_account',
        value: JSON.stringify([
          {
            id: 'test-account-id',
            appId: 'test-app-id',
            appSecret: 'test-app-secret',
            name: '测试账号',
          },
        ]),
      };

      const expectedResult = {
        success: true,
        message: '微信小程序通知发送成功',
        data: {},
      };

      mockUserService.findOne.mockResolvedValue(mockUser);
      mockDictionaryService.findByCategoryAndName.mockResolvedValue(mockDictionary);
      mockWechatMiniRun.mockResolvedValue(expectedResult);

      // 行动
      const actualResult = await service.send(task as unknown as NotificationTask);

      // 断言
      expect(mockUserService.findOne).toHaveBeenCalledWith(1);
      expect(mockDictionaryService.findByCategoryAndName).toHaveBeenCalledWith('wechat', 'wechat_mini_program_account');
      expect(mockWechatMiniRun).toHaveBeenCalledWith({
        appId: 'test-app-id',
        appSecret: 'test-app-secret',
        openid: 'test-openid',
        templateId: 'test-template-id',
        page: 'pages/index/index',
        data: {
          thing1: { value: '测试内容' },
        },
      });
      expect(actualResult).toEqual(expectedResult);
    });

    // 暂时跳过微信公众号测试，等待appid申请
    it.skip('应该成功发送微信公众号通知', async () => {
      // 安排
      const task = {
        id: 1,
        userId: 1,
        channel: NotificationChannel.WECHAT_MP,
        channelConfig: {
          accountId: 'test-account-id',
          templateId: 'test-template-id',
          url: 'https://example.com',
          data: {
            first: { value: '测试标题' },
            remark: { value: '测试内容' },
          },
        },
        content: {
          title: '测试标题',
        },
      } as unknown as NotificationTask;

      const mockDictionary = {
        id: 1,
        category: 'wechat',
        name: 'wechat_mini_program_account',
        value: JSON.stringify([
          {
            id: 'test-account-id',
            appId: 'test-app-id',
            appSecret: 'test-app-secret',
            name: '测试账号',
          },
        ]),
      };

      const expectedResult = {
        success: true,
        message: '微信公众号通知发送成功',
        data: {},
      };

      mockUserService.findOne.mockResolvedValue(mockUser);
      mockDictionaryService.findByCategoryAndName.mockResolvedValue(mockDictionary);
      mockWechatMpRun.mockResolvedValue(expectedResult);

      // 行动
      const actualResult = await service.send(task as unknown as NotificationTask);

      // 断言
      expect(mockUserService.findOne).toHaveBeenCalledWith(1);
      expect(mockDictionaryService.findByCategoryAndName).toHaveBeenCalledWith('wechat', 'wechat_mini_program_account');
      expect(mockWechatMpRun).toHaveBeenCalledWith({
        appId: 'test-app-id',
        appSecret: 'test-app-secret',
        openid: 'test-openid',
        templateId: 'test-template-id',
        url: 'https://example.com',
        data: {
          first: { value: '测试标题' },
          remark: { value: '测试内容' },
        },
      });
      expect(actualResult).toEqual(expectedResult);
    });

    it('应该成功发送URL通知', async () => {
      // 安排
      const task = {
        id: 1,
        userId: 1,
        channel: NotificationChannel.URL,
        channelConfig: {
          url: 'https://example.com/webhook',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            userId: '{userId}',
            userName: '{userName}',
            customData: 'test',
          },
        },
        content: {
          extraData: 'extra',
        },
      } as unknown as NotificationTask;

      const expectedResult = {
        success: true,
        message: 'URL通知发送成功',
        data: {},
      };

      mockUserService.findOne.mockResolvedValue(mockUser);
      mockUrlRun.mockResolvedValue(expectedResult);

      // 行动
      const actualResult = await service.send(task as unknown as NotificationTask);

      // 断言
      expect(mockUserService.findOne).toHaveBeenCalledWith(1);
      expect(mockUrlRun).toHaveBeenCalledWith(
        {
          url: 'https://example.com/webhook',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            userId: '{userId}',
            userName: '{userName}',
            customData: 'test',
          },
        },
        {
          userId: 1,
          userName: 'testuser',
          userPhone: '13800138000',
          userEmail: 'test@example.com',
          extraData: 'extra',
        },
      );
      expect(actualResult).toEqual(expectedResult);
    });

    it('应该抛出HttpException当用户不存在时', async () => {
      // 安排
      const task = {
        id: 1,
        userId: 999,
        channel: NotificationChannel.FEISHU,
        channelConfig: {},
        content: {},
      } as unknown as NotificationTask;

      mockUserService.findOne.mockResolvedValue(null);

      // 行动 & 断言
      await expect(service.send(task as unknown as NotificationTask)).rejects.toThrow(HttpException);
      await expect(service.send(task as unknown as NotificationTask)).rejects.toThrow('用户不存在: 999');
      expect(mockUserService.findOne).toHaveBeenCalledWith(999);
      expect(mockFeishuRun).not.toHaveBeenCalled();
    });

    // 暂时跳过微信相关测试，等待appid申请
    it.skip('应该抛出HttpException当微信账号配置不存在时', async () => {
      // 安排
      const task = {
        id: 1,
        userId: 1,
        channel: NotificationChannel.WECHAT_MINI,
        channelConfig: {
          accountId: 'test-account-id',
        },
        content: {},
      } as unknown as NotificationTask;

      mockUserService.findOne.mockResolvedValue(mockUser);
      mockDictionaryService.findByCategoryAndName.mockResolvedValue(null);

      // 行动 & 断言
      await expect(service.send(task as unknown as NotificationTask)).rejects.toThrow(HttpException);
      await expect(service.send(task as unknown as NotificationTask)).rejects.toThrow('未配置微信账号');
      expect(mockDictionaryService.findByCategoryAndName).toHaveBeenCalled();
      expect(mockWechatMiniRun).not.toHaveBeenCalled();
    });

    // 暂时跳过微信相关测试，等待appid申请
    it.skip('应该抛出HttpException当微信账号配置为空时', async () => {
      // 安排
      const task = {
        id: 1,
        userId: 1,
        channel: NotificationChannel.WECHAT_MINI,
        channelConfig: {
          accountId: 'test-account-id',
        },
        content: {},
      } as unknown as NotificationTask;

      const mockDictionary = {
        id: 1,
        category: 'wechat',
        name: 'wechat_mini_program_account',
        value: JSON.stringify([]),
      };

      mockUserService.findOne.mockResolvedValue(mockUser);
      mockDictionaryService.findByCategoryAndName.mockResolvedValue(mockDictionary);

      // 行动 & 断言
      await expect(service.send(task as unknown as NotificationTask)).rejects.toThrow(HttpException);
      await expect(service.send(task as unknown as NotificationTask)).rejects.toThrow('微信账号配置为空');
    });

    // 暂时跳过微信相关测试，等待appid申请
    it.skip('应该抛出HttpException当找不到指定账号ID时', async () => {
      // 安排
      const task: NotificationTask = {
        id: 1,
        userId: 1,
        channel: NotificationChannel.WECHAT_MINI,
        channelConfig: {
          accountId: 'non-existent-account-id',
        },
        content: {},
      } as unknown as NotificationTask;

      const mockDictionary = {
        id: 1,
        category: 'wechat',
        name: 'wechat_mini_program_account',
        value: JSON.stringify([
          {
            id: 'test-account-id',
            appId: 'test-app-id',
            appSecret: 'test-app-secret',
            name: '测试账号',
          },
        ]),
      };

      mockUserService.findOne.mockResolvedValue(mockUser);
      mockDictionaryService.findByCategoryAndName.mockResolvedValue(mockDictionary);

      // 行动 & 断言
      await expect(service.send(task as unknown as NotificationTask)).rejects.toThrow(HttpException);
      await expect(service.send(task as unknown as NotificationTask)).rejects.toThrow('未找到ID为 non-existent-account-id 的微信账号');
    });

    // 暂时跳过微信相关测试，等待appid申请
    it.skip('应该抛出HttpException当用户未绑定微信openid时（微信小程序）', async () => {
      // 安排
      const task = {
        id: 1,
        userId: 1,
        channel: NotificationChannel.WECHAT_MINI,
        channelConfig: {
          accountId: 'test-account-id',
        },
        content: {},
      } as unknown as NotificationTask;

      const userWithoutOpenid = {
        ...mockUser,
        openid: null,
      };

      const mockDictionary = {
        id: 1,
        category: 'wechat',
        name: 'wechat_mini_program_account',
        value: JSON.stringify([
          {
            id: 'test-account-id',
            appId: 'test-app-id',
            appSecret: 'test-app-secret',
            name: '测试账号',
          },
        ]),
      };

      mockUserService.findOne.mockResolvedValue(userWithoutOpenid);
      mockDictionaryService.findByCategoryAndName.mockResolvedValue(mockDictionary);

      // 行动 & 断言
      await expect(service.send(task as unknown as NotificationTask)).rejects.toThrow(HttpException);
      await expect(service.send(task as unknown as NotificationTask)).rejects.toThrow('用户未绑定微信openid: 1');
    });

    // 暂时跳过微信相关测试，等待appid申请
    it.skip('应该抛出HttpException当用户未绑定微信openid时（微信公众号）', async () => {
      // 安排
      const task = {
        id: 1,
        userId: 1,
        channel: NotificationChannel.WECHAT_MP,
        channelConfig: {
          accountId: 'test-account-id',
        },
        content: {},
      } as unknown as NotificationTask;

      const userWithoutOpenid = {
        ...mockUser,
        openid: null,
      };

      const mockDictionary = {
        id: 1,
        category: 'wechat',
        name: 'wechat_mini_program_account',
        value: JSON.stringify([
          {
            id: 'test-account-id',
            appId: 'test-app-id',
            appSecret: 'test-app-secret',
            name: '测试账号',
          },
        ]),
      };

      mockUserService.findOne.mockResolvedValue(userWithoutOpenid);
      mockDictionaryService.findByCategoryAndName.mockResolvedValue(mockDictionary);

      // 行动 & 断言
      await expect(service.send(task as unknown as NotificationTask)).rejects.toThrow(HttpException);
      await expect(service.send(task as unknown as NotificationTask)).rejects.toThrow('用户未绑定微信openid: 1');
    });

    it('应该抛出HttpException当不支持的通知渠道时', async () => {
      // 安排
      const task = {
        id: 1,
        userId: 1,
        channel: 'UNKNOWN_CHANNEL' as NotificationChannel,
        channelConfig: {},
        content: {},
      } as unknown as NotificationTask;

      mockUserService.findOne.mockResolvedValue(mockUser);

      // 行动 & 断言
      await expect(service.send(task as unknown as NotificationTask)).rejects.toThrow(HttpException);
      await expect(service.send(task as unknown as NotificationTask)).rejects.toThrow('不支持的通知渠道: UNKNOWN_CHANNEL');
    });

    // 暂时跳过微信相关测试，等待appid申请
    it.skip('应该使用content作为data当微信小程序channelConfig.data不存在时', async () => {
      // 安排
      const task = {
        id: 1,
        userId: 1,
        channel: NotificationChannel.WECHAT_MINI,
        channelConfig: {
          accountId: 'test-account-id',
          templateId: 'test-template-id',
          page: 'pages/index/index',
        },
        content: {
          thing1: { value: '测试内容' },
        },
      } as unknown as NotificationTask;

      const mockDictionary = {
        id: 1,
        category: 'wechat',
        name: 'wechat_mini_program_account',
        value: JSON.stringify([
          {
            id: 'test-account-id',
            appId: 'test-app-id',
            appSecret: 'test-app-secret',
            name: '测试账号',
          },
        ]),
      };

      const expectedResult = {
        success: true,
        message: '微信小程序通知发送成功',
        data: {},
      };

      mockUserService.findOne.mockResolvedValue(mockUser);
      mockDictionaryService.findByCategoryAndName.mockResolvedValue(mockDictionary);
      mockWechatMiniRun.mockResolvedValue(expectedResult);

      // 行动
      await service.send(task as unknown as NotificationTask);

      // 断言
      expect(mockWechatMiniRun).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            thing1: { value: '测试内容' },
          },
        }),
      );
    });

    // 暂时跳过微信相关测试，等待appid申请
    it.skip('应该使用content作为data当微信公众号channelConfig.data不存在时', async () => {
      // 安排
      const task = {
        id: 1,
        userId: 1,
        channel: NotificationChannel.WECHAT_MP,
        channelConfig: {
          accountId: 'test-account-id',
          templateId: 'test-template-id',
          url: 'https://example.com',
        },
        content: {
          first: { value: '测试标题' },
        },
      } as unknown as NotificationTask;

      const mockDictionary = {
        id: 1,
        category: 'wechat',
        name: 'wechat_mini_program_account',
        value: JSON.stringify([
          {
            id: 'test-account-id',
            appId: 'test-app-id',
            appSecret: 'test-app-secret',
            name: '测试账号',
          },
        ]),
      };

      const expectedResult = {
        success: true,
        message: '微信公众号通知发送成功',
        data: {},
      };

      mockUserService.findOne.mockResolvedValue(mockUser);
      mockDictionaryService.findByCategoryAndName.mockResolvedValue(mockDictionary);
      mockWechatMpRun.mockResolvedValue(expectedResult);

      // 行动
      await service.send(task as unknown as NotificationTask);

      // 断言
      expect(mockWechatMpRun).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            first: { value: '测试标题' },
          },
        }),
      );
    });

    it('应该使用默认POST方法当URL通知未指定method时', async () => {
      // 安排
      const task = {
        id: 1,
        userId: 1,
        channel: NotificationChannel.URL,
        channelConfig: {
          url: 'https://example.com/webhook',
        },
        content: {},
      } as unknown as NotificationTask;

      const expectedResult = {
        success: true,
        message: 'URL通知发送成功',
        data: {},
      };

      mockUserService.findOne.mockResolvedValue(mockUser);
      mockUrlRun.mockResolvedValue(expectedResult);

      // 行动
      await service.send(task as unknown as NotificationTask);

      // 断言
      expect(mockUrlRun).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
        }),
        expect.any(Object),
      );
    });
  });

  it('应该被定义', () => {
    expect(service).toBeDefined();
  });
});

