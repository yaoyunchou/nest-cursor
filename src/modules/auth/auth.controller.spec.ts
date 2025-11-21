/*
 * @Description: 认证控制器测试
 */
import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { WechatLoginDto } from './dto/wechat-login.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    register: jest.fn(),
    wechatLogin: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
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

      const expectedResult = {
        access_token: 'mock-jwt-token',
        user: {
          id: 1,
          username: 'testuser',
          roles: [],
        },
      };

      mockAuthService.login.mockResolvedValue(expectedResult);

      // 行动
      const actualResult = await controller.login(loginDto);

      // 断言
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
      expect(actualResult).toEqual(expectedResult);
    });

    it('应该抛出UnauthorizedException当登录失败时', async () => {
      // 安排
      const loginDto: LoginDto = {
        username: 'testuser',
        password: 'wrongPassword',
      };

      mockAuthService.login.mockRejectedValue(new UnauthorizedException('用户名或密码错误'));

      // 行动 & 断言
      await expect(controller.login(loginDto)).rejects.toThrow(UnauthorizedException);
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

      const expectedResult = {
        message: '注册成功',
        userId: 1,
      };

      mockAuthService.register.mockResolvedValue(expectedResult);

      // 行动
      const actualResult = await controller.register(registerDto);

      // 断言
      expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
      expect(actualResult).toEqual(expectedResult);
    });
  });

  describe('wechatLogin', () => {
    it('应该成功进行微信登录', async () => {
      // 安排
      const wechatLoginDto: WechatLoginDto = {
        code: 'test-code',
        phone: '13800138000',
      };

      const expectedResult = {
        token: 'mock-jwt-token',
        user: {
          id: 1,
          username: 'testuser',
        },
      };

      mockAuthService.wechatLogin.mockResolvedValue(expectedResult);

      // 行动
      const actualResult = await controller.wechatLogin(wechatLoginDto);

      // 断言
      expect(mockAuthService.wechatLogin).toHaveBeenCalledWith(wechatLoginDto);
      expect(actualResult).toEqual(expectedResult);
    });
  });

  it('应该被定义', () => {
    expect(controller).toBeDefined();
  });
});

