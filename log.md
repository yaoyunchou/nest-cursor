# 变更日志

## 2025-01-23（晚上）

### 为user和auth模块添加完整的测试用例

1. **User模块测试用例**
   - 为`UserService`创建了完整的测试用例（`user.service.spec.ts`）
   - 为`UserController`创建了完整的测试用例（`user.controller.spec.ts`）

2. **UserService测试覆盖**
   - 测试了用户创建功能（包括默认角色分配）
   - 测试了用户查询功能（列表查询、单个查询、按用户名查询）
   - 测试了用户更新功能
   - 测试了用户删除功能（包括关联目标的删除）
   - 测试了密码更新功能（包括旧密码验证）
   - 测试了角色管理功能（分配角色、移除角色、获取角色列表）
   - 测试了密码重置功能（管理员权限验证）
   - 测试了各种错误场景（用户不存在、密码错误、权限不足等）

3. **UserController测试覆盖**
   - 测试了所有API端点的调用
   - 测试了错误处理（如用户不存在时抛出NotFoundException）
   - 测试了当前用户信息获取功能

4. **Auth模块测试用例**
   - 为`AuthService`创建了完整的测试用例（`auth.service.spec.ts`）
   - 为`AuthController`创建了完整的测试用例（`auth.controller.spec.ts`）

5. **AuthService测试覆盖**
   - 测试了用户登录功能（包括密码验证和JWT生成）
   - 测试了用户注册功能（包括用户名冲突检查）
   - 测试了微信小程序登录功能（包括新用户创建、已存在用户登录、未提供手机号的情况）
   - 测试了微信access_token获取功能
   - 测试了用户手机号获取功能
   - 测试了各种错误场景（用户不存在、密码错误、微信API错误等）
   - Mock了外部API调用（微信API、fetch等）

6. **AuthController测试覆盖**
   - 测试了所有API端点的调用
   - 测试了错误处理

7. **测试规范遵循**
   - 遵循"安排-行动-断言"（AAA）测试模式
   - 使用清晰的测试变量命名
   - 使用测试替身（mock）模拟依赖和外部API
   - 覆盖主要功能和错误场景

## 2025-01-23（下午）

### 为通知任务模块添加完整的测试用例

1. **测试用例覆盖**
   - 为`NotificationService`创建了完整的测试用例（`notification.service.spec.ts`）
   - 为`NotificationTaskService`创建了完整的测试用例（`notification-task.service.spec.ts`）
   - 为`NotificationTaskController`创建了完整的测试用例（`notification-task.controller.spec.ts`）

2. **NotificationService测试用例**
   - 测试了所有通知渠道的发送功能（飞书、微信小程序、微信公众号、URL）
   - 测试了各种错误场景（用户不存在、微信账号配置不存在、用户未绑定openid等）
   - 测试了URL通知的模板变量替换功能
   - 测试了默认参数的处理（如URL通知的默认POST方法）

3. **NotificationTaskService测试用例**
   - 测试了任务的CRUD操作（创建、查询、更新、删除）
   - 测试了任务状态管理（暂停、恢复）
   - 测试了各种调度类型的下次执行时间计算（一次性、间隔、每日、每周、每月）
   - 测试了任务执行信息更新逻辑
   - 测试了分页和筛选功能

4. **NotificationTaskController测试用例**
   - 测试了所有API端点的调用
   - 测试了错误处理（如任务不存在时抛出NotFoundException）
   - 测试了手动执行任务功能

5. **Jest配置优化**
   - 在`package.json`的Jest配置中添加了`moduleNameMapper`，支持路径别名`@/*`的解析
   - 确保测试能够正确解析使用路径别名的导入

6. **测试规范遵循**
   - 遵循"安排-行动-断言"（AAA）测试模式
   - 使用清晰的测试变量命名（mockX、expectedX、actualX）
   - 为每个公共方法编写了单元测试
   - 使用测试替身（mock）模拟依赖

## 2025-01-23

### 新增通知任务模块

1. **通知任务模块开发完成**
   - 实现了完整的通知任务管理系统
   - 支持多种通知渠道：飞书、微信小程序、微信公众号、URL
   - 支持多种调度策略：一次性、间隔、每日、每周、每月
   - 实现了任务创建、查询、更新、删除、暂停、恢复功能
   - 实现了自动调度执行和手动执行功能

2. **核心功能特点**
   - **多渠道支持**：飞书开放平台API、微信小程序订阅消息、微信公众号模板消息、URL通知
   - **灵活调度**：支持一次性、间隔（每隔xx小时）、每日、每周、每月等多种调度方式
   - **任务管理**：完整的CRUD操作，支持任务暂停和恢复
   - **执行记录**：详细记录每次通知执行的请求和响应数据
   - **自动调度**：使用@nestjs/schedule实现定时任务，每分钟检查并执行到期任务

3. **技术实现亮点**
   - 使用TypeORM实现数据持久化
   - 使用@nestjs/schedule实现定时任务调度
   - 将不同通知方式封装为独立的notifier文件（feishu.notifier.ts、wechat-mini.notifier.ts、wechat-mp.notifier.ts、url.notifier.ts）
   - 统一的NotificationService作为调用入口
   - 支持URL通知的模板变量替换（如{userId}、{userName}等）
   - 完善的错误处理和日志记录

4. **数据模型设计**
   - **NotificationTask实体**：任务主表，包含任务信息、渠道配置、调度配置、执行状态等
   - **NotificationLog实体**：执行日志表，记录每次通知执行的详细信息
   - 支持JSON字段存储灵活的配置信息

5. **API接口设计**
   - `POST /notification-task`：创建通知任务（需要admin或editor权限）
   - `GET /notification-task`：查询任务列表（支持分页和筛选）
   - `GET /notification-task/:id`：查询任务详情
   - `PUT /notification-task/:id`：更新任务（需要admin或editor权限）
   - `DELETE /notification-task/:id`：删除任务（需要admin权限）
   - `POST /notification-task/:id/pause`：暂停任务（需要admin或editor权限）
   - `POST /notification-task/:id/resume`：恢复任务（需要admin或editor权限）
   - `POST /notification-task/:id/execute`：手动执行任务（测试用，需要admin或editor权限）

6. **通知方式实现**
   - **飞书通知**：使用飞书开放平台API，支持发送文本消息给指定用户
   - **微信小程序通知**：发送订阅消息，自动格式化模板数据
   - **微信公众号通知**：发送模板消息，支持自定义颜色
   - **URL通知**：支持GET/POST/PUT/DELETE方法，支持自定义请求头和请求体，支持模板变量替换

7. **调度策略实现**
   - **一次性**：在指定时间执行一次
   - **间隔**：从开始时间起，每隔指定小时数执行
   - **每日**：每天指定时间执行
   - **每周**：每周指定星期几的指定时间执行
   - **每月**：每月指定日期的指定时间执行

## 2025-01-22

### 修复角色唯一索引冲突错误

1. **问题描述**
   - 错误信息：`QueryFailedError: Duplicate entry '' for key 'role.IDX_ee999bb389d7ac0fd967172c41'`
   - 原因：数据库中已存在 `code` 字段为空字符串的记录，当 TypeORM 尝试同步数据库结构时，无法创建唯一索引，因为违反了唯一性约束

2. **修复内容**
   - **实体层修复**（`src/modules/role/entities/role.entity.ts`）
     - 为 `code` 字段添加 `nullable: false` 约束，确保该字段不能为空
     - 明确字段的唯一性和非空性要求
   
   - **服务层修复**（`src/modules/role/role.service.ts`）
     - 实现 `OnModuleInit` 生命周期钩子，确保在模块初始化完成后再执行角色初始化
     - 新增 `cleanupInvalidRoles()` 方法：在初始化角色之前清理数据库中可能存在的空字符串或 null 值的记录
     - 改进 `initializeRoles()` 方法：添加错误处理和清理逻辑，确保初始化前先清理无效数据
     - 改进 `create()` 方法：
       - 添加 `code` 字段非空验证
       - 验证 `code` 是否为有效的 `RoleCode` 枚举值
       - 检查 `code` 是否已存在，防止重复创建
       - 提供清晰的错误提示信息

   - **数据库清理脚本**（`scripts/cleanup-invalid-roles.ts`）
     - 创建独立的数据库清理脚本，用于在应用启动前手动清理无效记录
     - 支持通过 npm 脚本运行：`npm run cleanup:roles`
     - 脚本会查询并显示所有无效记录，然后删除它们

3. **技术实现**
   - 使用 `OnModuleInit` 生命周期钩子，确保数据库连接建立后再执行清理
   - 使用原生 SQL 查询清理无效记录：`DELETE FROM role WHERE code = '' OR code IS NULL`
   - 先查询再删除，避免并发问题
   - 添加完整的错误处理和日志记录
   - 确保数据完整性，防止未来再次出现类似问题

4. **使用方法**
   - **方法一（推荐）**：运行清理脚本
     ```bash
     npm run cleanup:roles
     ```
     或
     ```bash
     npx ts-node -r tsconfig-paths/register scripts/cleanup-invalid-roles.ts
     ```
   - **方法二**：应用启动时会自动清理（需要等待数据库连接建立）

5. **影响范围**
   - 修复后，应用启动时会自动清理无效的角色记录
   - 创建角色时会进行严格的数据验证
   - 提高了系统的数据完整性和健壮性
   - 提供了手动清理工具，方便在紧急情况下使用

## 2025-01-18

### 新增ESP32芯片管理模块

1. **创建ESP32芯片实体（Entity）**
   - 文件：`src/modules/esp32/entities/esp32.entity.ts`
   - 字段：
     - `id`: 主键，自增ID
     - `bindingId`: 绑定ID，唯一标识，系统自动生成UUID
     - `chipModel`: 芯片型号（可选）
     - `remark`: 备注（可选）
     - `function`: 功能（可选）
     - `orderSource`: 订单来源（可选）
     - `orderId`: 订单ID（可选）
     - `createdAt`: 创建时间
     - `updatedAt`: 更新时间

2. **创建DTO类**
   - `CreateEsp32Dto`: 创建ESP32芯片的DTO（`src/modules/esp32/dto/create-esp32.dto.ts`）
   - `UpdateEsp32Dto`: 更新ESP32芯片的DTO（`src/modules/esp32/dto/update-esp32.dto.ts`）
   - 所有字段均为可选，系统自动生成id和bindingId

3. **创建Service服务类**
   - 文件：`src/modules/esp32/esp32.service.ts`
   - 功能：
     - `create()`: 创建ESP32芯片，自动生成UUID作为bindingId
     - `findAll()`: 获取所有ESP32芯片列表，按创建时间倒序
     - `findOne()`: 根据ID获取芯片详情
     - `findByBindingId()`: 根据绑定ID获取芯片详情
     - `update()`: 更新芯片信息
     - `remove()`: 删除芯片

4. **创建Controller控制器类**
   - 文件：`src/modules/esp32/esp32.controller.ts`
   - API端点：
     - `POST /esp32`: 创建芯片（需要ADMIN或EDITOR权限）
     - `GET /esp32`: 获取所有芯片列表（需要登录）
     - `GET /esp32/:id`: 根据ID获取芯片详情（需要登录）
     - `GET /esp32/binding/:bindingId`: 根据绑定ID获取芯片详情（需要登录）
     - `PUT /esp32/:id`: 更新芯片信息（需要ADMIN或EDITOR权限）
     - `DELETE /esp32/:id`: 删除芯片（需要ADMIN权限）

5. **创建Module模块类**
   - 文件：`src/modules/esp32/esp32.module.ts`
   - 注册了TypeORM实体、Service和Controller

6. **在app.module.ts中注册新模块**
   - 文件：`src/app.module.ts`
   - 添加了`Esp32Module`到imports数组

## 2025-01-18

### 修复依赖注入和数据库配置问题

1. **修复 FileModule 依赖注入错误**
   - 问题：`FileService` 需要 `QiniuService`，但 `FileModule` 的 `providers` 中缺少 `QiniuService`
   - 解决：在 `src/modules/file/file.module.ts` 中添加 `QiniuService` 到 `providers` 数组
   - 文件：`src/modules/file/file.module.ts`

2. **修复数据库驱动配置错误**
   - 问题：`process.env.DB_TYPE` 为 undefined，导致 TypeORM 无法识别数据库驱动类型
   - 原因：在 `TypeOrmModule.forRoot()` 中直接使用 `process.env`，此时 `ConfigModule` 可能还未完全加载
   - 解决：改用 `TypeOrmModule.forRootAsync()` 配合 `ConfigService` 异步加载数据库配置
   - 文件：`src/app.module.ts`
   - 变更内容：
     - 导入 `ConfigService`
     - 将 `TypeOrmModule.forRoot()` 改为 `TypeOrmModule.forRootAsync()`
     - 使用 `useFactory` 和 `ConfigService` 来读取环境变量

3. **修复 TypeScript 类型错误**
   - 问题：`ConfigService.get()` 返回类型过宽泛，导致类型不匹配错误
   - 错误信息：`Type 'string | (() => string) | (() => Promise<string>)' is not assignable to type 'string'`
   - 解决：为所有 `configService.get()` 调用添加泛型类型参数 `<string>`
   - 文件：`src/app.module.ts`
   - 变更内容：
     - 将所有 `configService.get('KEY')` 改为 `configService.get<string>('KEY')`
     - 为 `DB_PORT` 添加默认值 `'3306'` 以防止 undefined

## 2025-01-18

### 新增ESP32芯片健康检查接口

1. **新增健康检查接口**
   - 文件：`src/modules/esp32/esp32.controller.ts`
   - 新增API端点：`GET /esp32/health/:bindingId`
   - 功能：ESP32芯片健康检查，无需权限验证
   - 参数：`bindingId` - 芯片绑定ID（路径参数）
   - 返回：包含状态、绑定ID和时间戳的JSON对象
   - 特性：
     - 使用 `@Public()` 装饰器跳过JWT和角色权限验证
     - 根据bindingId查找芯片，验证芯片是否存在
     - 返回格式：`{ status: 'ok', bindingId: string, timestamp: string }`

2. **新增Service方法**
   - 文件：`src/modules/esp32/esp32.service.ts`
   - 新增方法：`checkHealth(bindingId: string)`
   - 功能：根据bindingId查找芯片并返回健康状态
   - 如果芯片不存在，会抛出 `NotFoundException` 异常

3. **路由顺序优化**
   - 调整了controller中的路由顺序，将更具体的路由（`health/:bindingId`、`binding/:bindingId`）放在通用路由（`:id`）之前
   - 避免路由匹配冲突，确保健康检查接口能正确匹配

## 2025-01-18

### 修复角色权限验证问题

1. **修复角色守卫中文角色名称匹配问题**
   - 问题：数据库中存储的角色名称是中文（如 `'管理员'`），但代码中使用的是英文代码（如 `'admin'`），导致角色权限验证失败，返回403错误
   - 原因：`roles.guard.ts` 中直接将中文角色名称转小写后与英文代码比较，无法匹配
   - 解决：在 `src/modules/auth/guards/roles.guard.ts` 中添加角色名称到代码的映射表
   - 变更内容：
     - 新增 `ROLE_NAME_TO_CODE_MAP` 映射表，将中文角色名称映射到英文代码
     - 支持的角色映射：`'管理员' -> 'admin'`、`'编辑' -> 'editor'`、`'用户' -> 'user'`、`'访客' -> 'visitor'`
     - 优化角色验证逻辑，先尝试直接匹配，再通过映射表转换
     - 添加用户和角色数据的空值检查，提高代码健壮性
     - 移除了调试用的 console.log 语句
   - 影响：修复后，拥有中文角色名称的用户可以正常通过权限验证，访问需要相应权限的API接口

## 2025-01-18

### 移除未使用的依赖包

1. **移除 @nestjs/schedule 依赖**
   - 原因：项目中未使用该模块
   - 变更：从 `package.json` 中移除了 `@nestjs/schedule` 依赖
   - 文件：`package.json`

### 新增ESP32健康检查IP监控和告警功能

1. **实现IP请求监控和超时告警**
   - 功能：监控每个IP的健康检查请求，如果某个IP超过1分钟未发送请求，则触发告警
   - 文件：`src/modules/esp32/esp32.service.ts`、`src/modules/esp32/esp32.controller.ts`
   - 实现内容：
     - 在 `checkHealth` 方法中获取客户端IP地址
     - 使用 `Map` 记录每个IP的最后请求时间
     - 实现 `OnModuleInit` 和 `OnModuleDestroy` 生命周期钩子
     - 启动定时器，每30秒检查一次超时的IP
     - 超时时间设置为1分钟（60000毫秒）
     - 当IP超时时，调用 `SystemLogService.logAlert` 记录告警日志
     - 避免重复告警：已告警的IP在1分钟内不会再次触发告警
     - 当IP恢复请求时，自动清除告警记录
   - 技术细节：
     - 使用 `OnModuleInit` 在服务启动时启动定时检查
     - 使用 `OnModuleDestroy` 在服务停止时清理定时器
     - 支持从 `x-forwarded-for` 请求头获取真实IP（适用于反向代理场景）
     - 告警信息包含IP地址、最后请求时间和超时分钟数
   - 依赖：已注入 `SystemLogService` 用于记录告警日志

