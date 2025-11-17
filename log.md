# 变更日志

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

