# 用户模块开发模板（标准参考）

本模板总结了user模块的目录结构、技术选型、代码规范和典型用法，建议后续所有业务模块严格参考本模板进行开发。

---

## 目录结构

```
user/
├── dto/                  # 数据传输对象（DTO）目录
│   ├── create-user.dto.ts
│   ├── update-user.dto.ts
│   ├── query-user.dto.ts
│   ├── update-password.dto.ts
│   └── user-response.dto.ts
├── entities/             # TypeORM实体目录
│   └── user.entity.ts
├── user.controller.ts    # 控制器
├── user.service.ts       # 服务层
├── user.module.ts        # 模块注册
└── templage.md           # 本模板文档
```

## 技术选型
- 框架：NestJS
- ORM：TypeORM
- 校验：class-validator
- 文档：Swagger（@nestjs/swagger）
- 依赖注入：NestJS DI
- 权限认证：JWT + 角色守卫
- 响应序列化：ClassSerializerInterceptor
- 单元测试：Jest

## 代码规范与设计要点

### 1. 实体（Entity）
- 统一放在entities目录，文件名用kebab-case，类名用PascalCase。
- 使用TypeORM装饰器（@Entity, @PrimaryGeneratedColumn, @Column, @CreateDateColumn, @UpdateDateColumn, @ManyToMany, @JoinTable等）。
- 字段加@ApiProperty注解，便于Swagger文档生成。
- 关联关系（如多对多）用TypeORM关系装饰器实现。
- 字段类型、注释、命名规范严格遵循TypeScript和项目约定。

### 2. DTO（数据传输对象）
- 统一放在dto目录，文件名用kebab-case，类名用PascalCase。
- 使用class-validator进行参数校验。
- DTO与实体解耦，响应DTO可通过构造函数或工具方法从实体转换。

### 3. 控制器（Controller）
- 负责路由、权限、参数校验、接口文档。
- 使用@ApiTags、@ApiOperation、@ApiResponse等Swagger装饰器。
- 路由前缀与模块名一致。
- 权限控制用@UseGuards(JwtAuthGuard)、@Roles、@RolesGuard等。
- 依赖注入服务层，参数用DTO类型。
- 返回值类型明确，统一用DTO或分页接口。

### 4. 服务层（Service）
- 负责业务逻辑、数据库操作、依赖注入。
- 通过@InjectRepository注入TypeORM仓库。
- 业务方法参数和返回值类型明确。
- 复杂逻辑拆分为私有方法。
- 错误处理用NestJS异常类（如NotFoundException、BadRequestException等）。

### 5. 命名与注释规范
- 变量、方法、类名用英文，驼峰/帕斯卡命名法。
- 文件、目录用kebab-case。
- 注释、接口文档用中文，描述清晰。
- DTO、实体、服务、控制器均加JSDoc注释。

### 6. 接口风格
- RESTful风格，资源名用复数。
- GET/POST/PUT/DELETE等HTTP动词语义清晰。
- 支持分页、筛选、排序。
- 统一响应结构，分页用PaginatedResponse。

### 7. 依赖注入与模块注册
- 所有依赖通过构造函数注入。
- 模块注册用@Module，imports/providers/controllers/exports分离清晰。

### 8. 权限与认证
- 认证用JWT，守卫用JwtAuthGuard。
- 角色权限用Roles装饰器+RolesGuard实现。
- 敏感操作需加权限校验。

### 9. 测试建议
- 单元测试用Jest，测试文件与业务文件同级或tests目录。
- 测试用例命名清晰，覆盖主要业务逻辑。

---

## 典型代码片段

### 实体定义
```ts
@Entity('user')
export class User {
  @ApiProperty({ description: '用户ID' })
  @PrimaryGeneratedColumn()
  id: number;
  // ... 其他字段 ...
  @ManyToMany(() => Role, { cascade: true })
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: Role[];
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
}
```

### DTO定义
```ts
export class CreateUserDto {
  @IsString()
  username: string;
  // ... 其他字段 ...
}
```

### 控制器定义
```ts
@ApiTags('用户管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('user')
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}
  // ... 路由方法 ...
}
```

### 服务层定义
```ts
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly roleService: RoleService,
  ) {}
  // ... 业务方法 ...
}
```

---

## 参考建议
- 新模块开发时，务必严格参考本模板的目录结构、技术选型和代码规范。
- 所有DTO、实体、控制器、服务、模块注册、权限、测试等均应与user模块保持一致。
- 注重注释和接口文档，便于团队协作和API自动化。
- 如有特殊需求，先在本模板基础上扩展并补充说明。 