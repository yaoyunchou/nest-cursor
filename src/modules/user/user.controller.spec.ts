/*
 * @Description: 用户控制器测试
 */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { QueryUserDto } from './dto/query-user.dto';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  const mockUserService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    updatePassword: jest.fn(),
    resetPassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('应该成功创建用户', async () => {
      // 安排
      const createUserDto: CreateUserDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      const expectedUser = {
        id: 1,
        ...createUserDto,
      };

      mockUserService.create.mockResolvedValue(expectedUser);

      // 行动
      const actualUser = await controller.create(createUserDto);

      // 断言
      expect(mockUserService.create).toHaveBeenCalledWith(createUserDto);
      expect(actualUser).toEqual(expectedUser);
    });
  });

  describe('findAll', () => {
    it('应该成功查询用户列表', async () => {
      // 安排
      const query: QueryUserDto = {
        pageIndex: 1,
        pageSize: 10,
      };

      const expectedResult = {
        list: [
          { id: 1, username: 'user1' },
          { id: 2, username: 'user2' },
        ],
        total: 2,
        pageSize: 10,
        pageIndex: 1,
      };

      mockUserService.findAll.mockResolvedValue(expectedResult);

      // 行动
      const actualResult = await controller.findAll(query);

      // 断言
      expect(mockUserService.findAll).toHaveBeenCalledWith(query);
      expect(actualResult).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('应该成功查询单个用户', async () => {
      // 安排
      const id = 1;
      const expectedUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
      };

      mockUserService.findOne.mockResolvedValue(expectedUser);

      // 行动
      const actualUser = await controller.findOne(id);

      // 断言
      expect(mockUserService.findOne).toHaveBeenCalledWith(id);
      expect(actualUser).toEqual(expectedUser);
    });

    it('应该抛出NotFoundException当用户不存在时', async () => {
      // 安排
      const id = 999;
      mockUserService.findOne.mockRejectedValue(new NotFoundException('用户ID 999 不存在'));

      // 行动 & 断言
      await expect(controller.findOne(id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findUserInfo', () => {
    it('应该成功获取当前用户信息', async () => {
      // 安排
      const req = {
        user: {
          userId: '1',
        },
      };

      const expectedUser = {
        id: 1,
        username: 'testuser',
      };

      mockUserService.findOne.mockResolvedValue(expectedUser);

      // 行动
      const actualUser = await controller.findUserInfo(req);

      // 断言
      expect(mockUserService.findOne).toHaveBeenCalledWith(1);
      expect(actualUser).toEqual(expectedUser);
    });
  });

  describe('update', () => {
    it('应该成功更新用户', async () => {
      // 安排
      const id = 1;
      const updateUserDto: UpdateUserDto = {
        email: 'newemail@example.com',
      };

      const expectedUser = {
        id: 1,
        username: 'testuser',
        email: 'newemail@example.com',
      };

      mockUserService.update.mockResolvedValue(expectedUser);

      // 行动
      const actualUser = await controller.update(id, updateUserDto);

      // 断言
      expect(mockUserService.update).toHaveBeenCalledWith(id, updateUserDto);
      expect(actualUser).toEqual(expectedUser);
    });
  });

  describe('updatePassword', () => {
    it('应该成功修改密码', async () => {
      // 安排
      const req = {
        user: {
          userId: 1,
        },
      };

      const updatePasswordDto: UpdatePasswordDto = {
        oldPassword: 'oldPassword123',
        newPassword: 'newPassword123',
      };

      const expectedUser = {
        id: 1,
        username: 'testuser',
      };

      mockUserService.updatePassword.mockResolvedValue(expectedUser);

      // 行动
      const actualUser = await controller.updatePassword(req, updatePasswordDto);

      // 断言
      expect(mockUserService.updatePassword).toHaveBeenCalledWith(1, updatePasswordDto);
      expect(actualUser).toEqual(expectedUser);
    });
  });

  describe('remove', () => {
    it('应该成功删除用户', async () => {
      // 安排
      const id = 1;
      mockUserService.remove.mockResolvedValue(undefined);

      // 行动
      await controller.remove(id);

      // 断言
      expect(mockUserService.remove).toHaveBeenCalledWith(id);
    });
  });

  describe('resetPassword', () => {
    it('应该成功重置密码', async () => {
      // 安排
      const req = {
        user: {
          id: 1,
          username: 'admin',
        },
      };

      const id = 2;
      mockUserService.resetPassword.mockResolvedValue(undefined);

      // 行动
      await controller.resetPassword(req, id);

      // 断言
      expect(mockUserService.resetPassword).toHaveBeenCalledWith(req.user, id);
    });
  });

  it('应该被定义', () => {
    expect(controller).toBeDefined();
  });
});

