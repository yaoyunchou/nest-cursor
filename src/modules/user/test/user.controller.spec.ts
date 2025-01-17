/*
 * @Author: yaoyc yaoyunchou@bananain.com
 * @Date: 2025-01-16 15:40:44
 * @LastEditors: yaoyc yaoyunchou@bananain.com
 * @LastEditTime: 2025-01-16 15:40:44
 * @FilePath: \nest-cursor\src\modules\user\test\user.controller.spec.ts
 * @Description: 用户控制器单元测试
 */
import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../user.controller';
import { UserService } from '../user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { QueryUserDto } from '../dto/query-user.dto';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  const mockUserService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
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

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createUserDto: CreateUserDto = {
        username: 'test',
        password: '123456',
        email: 'test@example.com',
      };

      const expectedUser = { id: 1, ...createUserDto };
      mockUserService.create.mockResolvedValue(expectedUser);

      const result = await controller.create(createUserDto);
      expect(result).toEqual(expectedUser);
      expect(service.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const queryDto: QueryUserDto = {
        pageIndex: 1,
        pageSize: 10,
      };

      const expectedResult = {
        list: [{ id: 1, username: 'test' }],
        total: 1,
        pageSize: 10,
        pageIndex: 1,
      };

      mockUserService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(queryDto);
      expect(result).toEqual(expectedResult);
      expect(service.findAll).toHaveBeenCalledWith(queryDto);
    });
  });
}); 