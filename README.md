# Modern api

这是一个cms系统的后台， 使用nestjs 和 typeorm 开发, 使用swagger 进行接口文档管理.

## 代码风格

- 使用驼峰命名法，代码使用英文完成， 注释使用中文完成。
- 使用eslint 进行代码检查， 使用prettier 进行代码格式化。
- 使用swagger 进行接口文档管理。
- 使用jest 进行单元测试。

## API功能

项目是分模块开发的， 每个模块都有自己的controller, service, entity, dto, interface, module, test。和对应的单元测试。 可以参考src/user 目录下的文件，做新的模块开发。

- 用户管理
  - 用户列表
    - 分页
    - 排序
    - 筛选， 可以让用户自己定义筛选条件
  - 用户详情
    - 用户信息
  - 用户创建
    - 用户名称
    - 用户邮箱
    - 用户密码
    - 用户角色
    - 用户状态
    - 用户头像（需要调用文件上传接口）
    - 用户备注
    - 用户角色， 一个用户有多个角色， 一个角色有多个用户
  - 用户更新
  - 用户删除
- 角色管理
  - 角色列表
  - 角色详情
  - 角色创建
  - 角色更新
  - 角色删除
- 权限管理
  - 权限列表
  - 权限详情
  - 权限创建
    - 权限名称
    - 权限描述
    - 权限类型
    - 权限状态
    - 权限码
  - 权限更新
  - 权限删除
- 菜单管理
- 日志管理
- 文件管理

- 系统配置

## 项目结构

src/
├── config/                     # 配置文件目录
│   ├── database.config.ts
│   └── jwt.config.ts
├── common/                     # 通用模块目录
│   ├── decorators/            # 自定义装饰器
│   ├── filters/               # 异常过滤器
│   ├── guards/                # 守卫
│   ├── interceptors/          # 拦截器
│   ├── middleware/            # 中间件
│   └── pipes/                 # 管道
├── modules/                    # 业务模块目录
│   ├── auth/                  # 认证模块
│   │   ├── dto/
│   │   ├── entities/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   └── auth.spec.ts
│   ├── user/                  # 用户模块
│   │   ├── dto/
│   │   ├── entities/
│   │   ├── user.controller.ts
│   │   ├── user.service.ts
│   │   ├── user.module.ts
│   │   └── user.spec.ts
│   └── role/                  # 角色模块
│       ├── dto/
│       ├── entities/
│       ├── role.controller.ts
│       ├── role.service.ts
│       ├── role.module.ts
│       └── role.spec.ts
├── shared/                    # 共享资源目录
│   ├── constants/            # 常量定义
│   ├── interfaces/          # 接口定义
│   └── utils/               # 工具函数
├── app.module.ts             # 根模块
├── app.controller.ts         # 根控制器
├── app.service.ts           # 根服务
└── main.ts                  # 应用入口文件

test/                        # 测试目录
├── e2e/                    # 端到端测试
└── unit/                   # 单元测试

├── .env                    # 环境变量
├── .env.development       # 开发环境变量
├── .env.production        # 生产环境变量
├── .gitignore
├── nest-cli.json
├── package.json
├── README.md
├── tsconfig.json
└── tsconfig.build.json

## 技术栈

- nestjs
- typeorm
- swagger
- mysql
- jwt
- bcrypt
- multer

