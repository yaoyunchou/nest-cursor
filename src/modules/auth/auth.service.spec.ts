/*
 * @Description: 认证服务测试
 */
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, ConflictException, HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { RedisService } from '../../core/services/redis/redis.service';
import { DictionaryService } from '../dictionary/dictionary.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { WechatLoginDto } from './dto/wechat-login.dto';
import { RoleCode } from '../role/entities/role.entity';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

// Mock fetch globally
global.fetch = jest.fn();

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let jwtService: JwtService;
  let redisService: RedisService;
  let dictionaryService: DictionaryService;

  const mockUserService = {
    findByUsername: jest.fn(),
    getUserRoles: jest.fn(),
    create: jest.fn(),
    findByOpenid: jest.fn(),
    update: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'SECRET') return 'test-secret';
      return undefined;
    }),
  };

  const mockRedisService = {
    set: jest.fn(),
    get: jest.fn(),
  };

  const mockDictionaryService = {
    findByCategoryAndName: jest.fn(),
  };

  beforeEach(async () => {
    // 重置所有mock
    jest.clearAllMocks();
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
        {
          provide: DictionaryService,
          useValue: mockDictionaryService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
    redisService = module.get<RedisService>(RedisService);
    dictionaryService = module.get<DictionaryService>(DictionaryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('应该成功登录', async () => {
      // 安排
      const loginDto: LoginDto = {
        username: 'testuser',
        password: 'password123',
      };

      const mockUser = {
        id: 1,
        username: 'testuser',
        password: 'hashedPassword',
      };

      const mockRoles = [RoleCode.USER];

      mockUserService.findByUsername.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockUserService.getUserRoles.mockResolvedValue(mockRoles);
      mockJwtService.sign.mockReturnValue('mock-jwt-token');

      // 行动
      const actualResult = await service.login(loginDto);

      // 断言
      expect(mockUserService.findByUsername).toHaveBeenCalledWith('testuser');
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
      expect(mockUserService.getUserRoles).toHaveBeenCalledWith(1);
      expect(mockJwtService.sign).toHaveBeenCalled();
      expect(actualResult.access_token).toBe('mock-jwt-token');
      expect(actualResult.user.id).toBe(1);
      expect(actualResult.user.username).toBe('testuser');
    });

    it('应该抛出UnauthorizedException当用户不存在时', async () => {
      // 安排
      const loginDto: LoginDto = {
        username: 'nonexistent',
        password: 'password123',
      };

      mockUserService.findByUsername.mockResolvedValue(null);

      // 行动 & 断言
      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('用户名或密码错误');
    });

    it('应该抛出UnauthorizedException当密码错误时', async () => {
      // 安排
      const loginDto: LoginDto = {
        username: 'testuser',
        password: 'wrongPassword',
      };

      const mockUser = {
        id: 1,
        username: 'testuser',
        password: 'hashedPassword',
      };

      mockUserService.findByUsername.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // 行动 & 断言
      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('用户名或密码错误');
    });
  });

  describe('register', () => {
    it('应该成功注册', async () => {
      // 安排
      const registerDto: RegisterDto = {
        username: 'newuser',
        password: 'password123',
        roles: [],
      };

      const mockUser = {
        id: 1,
        username: 'newuser',
        email: 'newuser@example.com',
      };

      mockUserService.findByUsername.mockResolvedValue(null);
      mockUserService.create.mockResolvedValue(mockUser);

      // 行动
      const actualResult = await service.register(registerDto);

      // 断言
      expect(mockUserService.findByUsername).toHaveBeenCalledWith('newuser');
      expect(mockUserService.create).toHaveBeenCalled();
      expect(actualResult.message).toBe('注册成功');
      expect(actualResult.userId).toBe(1);
    });

    it('应该抛出ConflictException当用户名已存在时', async () => {
      // 安排
      const registerDto: RegisterDto = {
        username: 'existinguser',
        password: 'password123',
        roles: [],
      };

      const existingUser = {
        id: 1,
        username: 'existinguser',
      };

      mockUserService.findByUsername.mockResolvedValue(existingUser);

      // 行动 & 断言
      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
      await expect(service.register(registerDto)).rejects.toThrow('用户名已存在');
    });
  });

  describe('wechatLogin', () => {
    it('应该成功登录已存在的微信用户', async () => {
      // 安排
      const wechatLoginDto: WechatLoginDto = {
        code: 'test-code',
        phone: '13800138000',
        accountId: 'test-account-id',
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

      const mockWechatResponse = {
        openid: 'test-openid',
        session_key: 'test-session-key',
      };

      const mockUser = {
        id: 1,
        username: 'testuser',
        openid: 'test-openid',
        avatar: 'test-avatar',
        phone: '13800138000',
      };

      mockDictionaryService.findByCategoryAndName.mockResolvedValue(mockDictionary);
      (global.fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockWechatResponse),
      });
      mockUserService.findByOpenid.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('mock-jwt-token');
      mockRedisService.set.mockResolvedValue(undefined);

      // 行动
      const actualResult = await service.wechatLogin(wechatLoginDto);

      // 断言
      expect(mockDictionaryService.findByCategoryAndName).toHaveBeenCalled();
      expect(mockUserService.findByOpenid).toHaveBeenCalledWith('test-openid');
      expect(mockJwtService.sign).toHaveBeenCalled();
      expect(mockRedisService.set).toHaveBeenCalledTimes(2);
      expect(actualResult.token).toBe('mock-jwt-token');
      expect(actualResult.user.id).toBe(1);
    });

    it('应该创建新用户当微信用户不存在时', async () => {
      // 安排
      const wechatLoginDto: WechatLoginDto = {
        code: 'test-code',
        username: 'newuser',
        avatar: 'test-avatar',
        phone: '13800138000',
        accountId: 'test-account-id',
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

      const mockWechatResponse = {
        openid: 'test-openid',
        session_key: 'test-session-key',
      };

      const mockNewUser = {
        id: 1,
        username: 'newuser',
        openid: 'test-openid',
        avatar: 'test-avatar',
        phone: '13800138000',
      };

      mockDictionaryService.findByCategoryAndName.mockResolvedValue(mockDictionary);
      (global.fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockWechatResponse),
      });
      mockUserService.findByOpenid.mockResolvedValue(null);
      mockUserService.create.mockResolvedValue(mockNewUser);
      mockJwtService.sign.mockReturnValue('mock-jwt-token');
      mockRedisService.set.mockResolvedValue(undefined);

      // 行动
      const actualResult = await service.wechatLogin(wechatLoginDto);

      // 断言
      expect(mockUserService.create).toHaveBeenCalled();
      expect(actualResult.token).toBe('mock-jwt-token');
    });

    it('应该返回null当新用户未提供手机号时', async () => {
      // 安排
      const wechatLoginDto: WechatLoginDto = {
        code: 'test-code',
        username: 'newuser',
        avatar: 'test-avatar',
        accountId: 'test-account-id',
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

      const mockWechatResponse = {
        openid: 'test-openid',
        session_key: 'test-session-key',
      };

      const mockNewUser = {
        id: 1,
        username: 'newuser',
        openid: 'test-openid',
      };

      mockDictionaryService.findByCategoryAndName.mockResolvedValue(mockDictionary);
      (global.fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockWechatResponse),
      });
      mockUserService.findByOpenid.mockResolvedValue(null);
      mockUserService.create.mockResolvedValue(mockNewUser);

      // 行动
      const actualResult = await service.wechatLogin(wechatLoginDto);

      // 断言
      expect(actualResult.message).toBe('用户没有注册');
      expect(actualResult.data).toBeNull();
    });

    it('应该抛出HttpException当微信API返回错误时', async () => {
      // 安排
      const wechatLoginDto: WechatLoginDto = {
        code: 'invalid-code',
        accountId: 'test-account-id',
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

      const mockWechatErrorResponse = {
        errcode: 40013,
        errmsg: 'invalid code',
      };

      mockDictionaryService.findByCategoryAndName.mockResolvedValue(mockDictionary);
      (global.fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockWechatErrorResponse),
      });

      // 行动 & 断言
      await expect(service.wechatLogin(wechatLoginDto)).rejects.toThrow(HttpException);
    });
  });

  describe('getAccessToken', () => {
    it('应该成功获取access_token', async () => {
      // 安排
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

      const mockResponse = {
        access_token: 'test-access-token',
      };

      mockDictionaryService.findByCategoryAndName.mockResolvedValue(mockDictionary);
      (global.fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      // 行动
      const actualToken = await service.getAccessToken('test-account-id');

      // 断言
      expect(actualToken).toBe('test-access-token');
    });

    it('应该抛出HttpException当获取access_token失败时', async () => {
      // 安排
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

      const mockErrorResponse = {
        errcode: 40001,
        errmsg: 'invalid credential',
      };

      mockDictionaryService.findByCategoryAndName.mockResolvedValue(mockDictionary);
      (global.fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockErrorResponse),
      });

      // 行动 & 断言
      await expect(service.getAccessToken('test-account-id')).rejects.toThrow(HttpException);
    });
  });

  describe('getUserPhoneNumber', () => {
    it('应该成功获取用户手机号', async () => {
      // 安排
      const code = 'phone-code';
      const userId = 1;

      const mockPhoneResponse = {
        phone_number: '13800138000',
      };

      mockRedisService.get.mockResolvedValue('test-openid');
      mockDictionaryService.findByCategoryAndName.mockResolvedValue({
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
      });
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue({ access_token: 'test-token' }),
        })
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue(mockPhoneResponse),
        });
      mockUserService.update.mockResolvedValue(undefined);

      // 行动
      const actualPhone = await service.getUserPhoneNumber(code, userId);

      // 断言
      expect(mockRedisService.get).toHaveBeenCalledWith(`openid:${userId}`);
      expect(actualPhone).toBe('13800138000');
      expect(mockUserService.update).toHaveBeenCalledWith(userId, { phone: '13800138000' });
    });

    it('应该抛出HttpException当用户未登录时', async () => {
      // 安排
      const code = 'phone-code';
      const userId = 1;

      mockRedisService.get.mockResolvedValue(null);

      // 行动 & 断言
      await expect(service.getUserPhoneNumber(code, userId)).rejects.toThrow(HttpException);
      await expect(service.getUserPhoneNumber(code, userId)).rejects.toThrow('用户未登录');
    });
  });

  it('应该被定义', () => {
    expect(service).toBeDefined();
  });
});

