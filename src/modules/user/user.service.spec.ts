/*
 * @Description: 用户服务测试
 */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { Target } from '../target/entities/target.entity';
import { RoleService } from '../role/role.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { RoleCode } from '../role/entities/role.entity';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<User>;
  let targetRepository: Repository<Target>;
  let roleService: RoleService;

  const createMockQueryBuilder = () => ({
    select: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
  });

  const mockUserRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(createMockQueryBuilder),
  };

  const mockTargetRepository = {
    find: jest.fn(),
    delete: jest.fn(),
  };

  const mockRoleService = {
    findByCode: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Target),
          useValue: mockTargetRepository,
        },
        {
          provide: RoleService,
          useValue: mockRoleService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    targetRepository = module.get<Repository<Target>>(getRepositoryToken(Target));
    roleService = module.get<RoleService>(RoleService);
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
        roleIds: [1],
      };

      const mockRole = {
        id: 1,
        name: '用户',
        code: RoleCode.USER,
      };

      const mockUser = {
        id: 1,
        ...createUserDto,
        password: 'hashedPassword',
        roles: [mockRole],
      };

      mockRoleService.findOne.mockResolvedValue(mockRole);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      // 行动
      const actualUser = await service.create(createUserDto);

      // 断言
      expect(mockRoleService.findOne).toHaveBeenCalledWith(1);
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(actualUser.id).toBe(1);
      expect(actualUser.username).toBe('testuser');
    });

    it('应该使用默认用户角色当未提供角色ID时', async () => {
      // 安排
      const createUserDto: CreateUserDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      const mockRole = {
        id: 2,
        name: '用户',
        code: RoleCode.USER,
      };

      const mockUser = {
        id: 1,
        ...createUserDto,
        password: 'hashedPassword',
        roles: [mockRole],
      };

      mockRoleService.findByCode.mockResolvedValue(mockRole);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      // 行动
      await service.create(createUserDto);

      // 断言
      expect(mockRoleService.findByCode).toHaveBeenCalledWith(RoleCode.USER);
    });

    it('应该抛出BadRequestException当创建失败时', async () => {
      // 安排
      const createUserDto: CreateUserDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        roleIds: [1],
      };

      mockRoleService.findOne.mockRejectedValue(new Error('角色不存在'));

      // 行动 & 断言
      await expect(service.create(createUserDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('应该成功查询用户列表', async () => {
      // 安排
      const query = {
        pageIndex: 1,
        pageSize: 10,
      };

      const mockUsers = [
        {
          id: 1,
          username: 'user1',
          email: 'user1@example.com',
          roles: [],
        },
        {
          id: 2,
          username: 'user2',
          email: 'user2@example.com',
          roles: [],
        },
      ];

      const queryBuilder = createMockQueryBuilder();
      queryBuilder.getManyAndCount = jest.fn().mockResolvedValue([mockUsers, 2]);
      mockUserRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      // 行动
      const actualResult = await service.findAll(query);

      // 断言
      expect(mockUserRepository.createQueryBuilder).toHaveBeenCalledWith('user');
      expect(queryBuilder.getManyAndCount).toHaveBeenCalled();
      expect(actualResult.list).toHaveLength(2);
      expect(actualResult.total).toBe(2);
      expect(actualResult.pageSize).toBe(10);
      expect(actualResult.pageIndex).toBe(1);
    });

    it('应该支持按用户名筛选', async () => {
      // 安排
      const query = {
        pageIndex: 1,
        pageSize: 10,
        username: 'test',
      };

      const queryBuilder = createMockQueryBuilder();
      queryBuilder.getManyAndCount = jest.fn().mockResolvedValue([[], 0]);
      mockUserRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      // 行动
      await service.findAll(query);

      // 断言
      expect(queryBuilder.andWhere).toHaveBeenCalledWith('user.username LIKE :username', { username: '%test%' });
    });

    it('应该支持按邮箱筛选', async () => {
      // 安排
      const query = {
        pageIndex: 1,
        pageSize: 10,
        email: 'test@example.com',
      };

      const queryBuilder = createMockQueryBuilder();
      queryBuilder.getManyAndCount = jest.fn().mockResolvedValue([[], 0]);
      mockUserRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      // 行动
      await service.findAll(query);

      // 断言
      expect(queryBuilder.andWhere).toHaveBeenCalledWith('user.email LIKE :email', { email: '%test@example.com%' });
    });
  });

  describe('findOne', () => {
    it('应该成功查询单个用户', async () => {
      // 安排
      const id = 1;
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        roles: [],
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      // 行动
      const actualUser = await service.findOne(id);

      // 断言
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id },
        relations: ['roles'],
      });
      expect(actualUser.id).toBe(1);
    });

    it('应该抛出NotFoundException当用户不存在时', async () => {
      // 安排
      const id = 999;
      mockUserRepository.findOne.mockResolvedValue(null);

      // 行动 & 断言
      await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(id)).rejects.toThrow('用户ID 999 不存在');
    });
  });

  describe('findByUsername', () => {
    it('应该成功根据用户名查找用户', async () => {
      // 安排
      const username = 'testuser';
      const mockUser = {
        id: 1,
        username: 'testuser',
        password: 'hashedPassword',
        email: 'test@example.com',
        roles: [],
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      // 行动
      const actualUser = await service.findByUsername(username);

      // 断言
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { username },
        relations: ['roles'],
        select: ['id', 'username', 'password', 'email', 'status'],
      });
      expect(actualUser).toEqual(mockUser);
    });
  });

  describe('update', () => {
    it('应该成功更新用户', async () => {
      // 安排
      const id = 1;
      const updateUserDto: UpdateUserDto = {
        email: 'newemail@example.com',
      };

      const existingUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        roles: [],
      };

      const updatedUser = {
        ...existingUser,
        ...updateUserDto,
      };

      mockUserRepository.findOne.mockResolvedValue(existingUser);
      mockUserRepository.save.mockResolvedValue(updatedUser);

      // 行动
      const actualUser = await service.update(id, updateUserDto);

      // 断言
      expect(mockUserRepository.findOne).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(actualUser.email).toBe('newemail@example.com');
    });

    it('应该抛出NotFoundException当用户不存在时', async () => {
      // 安排
      const id = 999;
      const updateUserDto: UpdateUserDto = {
        email: 'newemail@example.com',
      };

      mockUserRepository.findOne.mockResolvedValue(null);

      // 行动 & 断言
      await expect(service.update(id, updateUserDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('应该成功删除用户及其关联的目标', async () => {
      // 安排
      const id = 1;
      const mockUser = {
        id: 1,
        username: 'testuser',
      };

      const mockTargets = [
        { id: 1, userId: 1 },
        { id: 2, userId: 1 },
      ];

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockTargetRepository.find.mockResolvedValue(mockTargets);
      mockTargetRepository.delete.mockResolvedValue(undefined);
      mockUserRepository.remove.mockResolvedValue(undefined);

      // 行动
      await service.remove(id);

      // 断言
      expect(mockTargetRepository.find).toHaveBeenCalled();
      expect(mockTargetRepository.delete).toHaveBeenCalledTimes(2);
      expect(mockUserRepository.remove).toHaveBeenCalledWith(mockUser);
    });

    it('应该抛出NotFoundException当用户不存在时', async () => {
      // 安排
      const id = 999;
      mockUserRepository.findOne.mockResolvedValue(null);

      // 行动 & 断言
      await expect(service.remove(id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updatePassword', () => {
    it('应该成功更新密码', async () => {
      // 安排
      const userId = 1;
      const updatePasswordDto: UpdatePasswordDto = {
        oldPassword: 'oldPassword123',
        newPassword: 'newPassword123',
      };

      const mockUser = {
        id: 1,
        username: 'testuser',
        password: 'hashedOldPassword',
      };

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedNewPassword');
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        password: 'hashedNewPassword',
      });

      // 行动
      const actualUser = await service.updatePassword(userId, updatePasswordDto);

      // 断言
      expect(bcrypt.compare).toHaveBeenCalledWith('oldPassword123', 'hashedOldPassword');
      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword123', 10);
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('应该抛出NotFoundException当用户不存在时', async () => {
      // 安排
      const userId = 999;
      const updatePasswordDto: UpdatePasswordDto = {
        oldPassword: 'oldPassword123',
        newPassword: 'newPassword123',
      };

      mockUserRepository.findOne.mockResolvedValue(null);

      // 行动 & 断言
      await expect(service.updatePassword(userId, updatePasswordDto)).rejects.toThrow(NotFoundException);
    });

    it('应该抛出UnauthorizedException当旧密码错误时', async () => {
      // 安排
      const userId = 1;
      const updatePasswordDto: UpdatePasswordDto = {
        oldPassword: 'wrongPassword',
        newPassword: 'newPassword123',
      };

      const mockUser = {
        id: 1,
        username: 'testuser',
        password: 'hashedOldPassword',
      };

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      // 行动 & 断言
      await expect(service.updatePassword(userId, updatePasswordDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.updatePassword(userId, updatePasswordDto)).rejects.toThrow('旧密码错误');
    });
  });

  describe('findByOpenid', () => {
    it('应该成功根据openid查找用户', async () => {
      // 安排
      const openid = 'test-openid';
      const mockUser = {
        id: 1,
        username: 'testuser',
        openid: 'test-openid',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      // 行动
      const actualUser = await service.findByOpenid(openid);

      // 断言
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { openid },
      });
      expect(actualUser).toEqual(mockUser);
    });
  });

  describe('assignRole', () => {
    it('应该成功分配角色', async () => {
      // 安排
      const userId = 1;
      const roleCode = RoleCode.ADMIN;

      const existingUser = {
        id: 1,
        username: 'testuser',
        roles: [],
      };

      const mockRole = {
        id: 1,
        name: '管理员',
        code: RoleCode.ADMIN,
      };

      mockUserRepository.findOne.mockResolvedValue(existingUser);
      mockRoleService.findByCode.mockResolvedValue(mockRole);
      mockUserRepository.save.mockResolvedValue({
        ...existingUser,
        roles: [mockRole],
      });

      // 行动
      const actualUser = await service.assignRole(userId, roleCode);

      // 断言
      expect(mockRoleService.findByCode).toHaveBeenCalledWith(roleCode);
      expect(mockUserRepository.save).toHaveBeenCalled();
    });
  });

  describe('removeRole', () => {
    it('应该成功移除角色', async () => {
      // 安排
      const userId = 1;
      const roleCode = RoleCode.ADMIN;

      const existingUser = {
        id: 1,
        username: 'testuser',
        roles: [
          { id: 1, code: RoleCode.ADMIN },
          { id: 2, code: RoleCode.USER },
        ],
      };

      mockUserRepository.findOne.mockResolvedValue(existingUser);
      mockUserRepository.save.mockResolvedValue({
        ...existingUser,
        roles: [{ id: 2, code: RoleCode.USER }],
      });

      // 行动
      const actualUser = await service.removeRole(userId, roleCode);

      // 断言
      expect(mockUserRepository.save).toHaveBeenCalled();
    });
  });

  describe('getUserRoles', () => {
    it('应该成功获取用户角色代码列表', async () => {
      // 安排
      const userId = 1;
      const mockUser = {
        id: 1,
        username: 'testuser',
        roles: [
          { id: 1, code: RoleCode.ADMIN },
          { id: 2, code: RoleCode.USER },
        ],
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      // 行动
      const actualRoles = await service.getUserRoles(userId);

      // 断言
      expect(actualRoles).toEqual([RoleCode.ADMIN, RoleCode.USER]);
    });
  });

  describe('resetPassword', () => {
    it('应该成功重置密码当用户是管理员时', async () => {
      // 安排
      const user = {
        id: 1,
        username: 'admin',
        roles: [RoleCode.ADMIN],
      } as any;

      const targetUserId = 2;
      const targetUser = {
        id: 2,
        username: 'targetuser',
        password: 'oldPassword',
      };

      mockUserRepository.findOne.mockResolvedValue(targetUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedResetPassword');
      mockUserRepository.save.mockResolvedValue({
        ...targetUser,
        password: 'hashedResetPassword',
      });

      // 行动
      await service.resetPassword(user, targetUserId);

      // 断言
      expect(bcrypt.hash).toHaveBeenCalledWith('2025@xfy', 10);
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('应该抛出UnauthorizedException当用户不是管理员时', async () => {
      // 安排
      const user = {
        id: 1,
        username: 'user',
        roles: [{ code: RoleCode.USER }],
      } as any;

      const targetUserId = 2;

      // 行动 & 断言
      await expect(service.resetPassword(user, targetUserId)).rejects.toThrow(UnauthorizedException);
      await expect(service.resetPassword(user, targetUserId)).rejects.toThrow('无权限重置密码');
    });
  });

  it('应该被定义', () => {
    expect(service).toBeDefined();
  });
});

