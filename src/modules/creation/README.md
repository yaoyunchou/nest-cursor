# Creation 模块需求文档

## 概述
Creation模块用于管理用户的创作内容，支持作品的创建、展示、互动以及收藏功能。该模块包含作品管理和用户收藏功能，并集成了Coze AI服务用于图片生成。

## 业务需求

### 核心功能
1. **作品管理**：用户可以创建、编辑、删除自己的作品
2. **广场展示**：作品可以选择公开到创作广场供其他用户浏览
3. **社交互动**：支持对公开作品进行点赞、喜欢、收藏操作
4. **收藏管理**：用户可以收藏感兴趣的公开作品
5. **AI创作**：集成Coze AI服务，支持AI图片生成功能

### 数据模型

#### 1. 作品表 (Creation)
**表名**: `creations`

| 字段名 | 类型 | 说明 | 是否必填 | 默认值 |
|--------|------|------|----------|--------|
| id | number | 主键ID | 是 | 自增 |
| title | string | 作品标题 | 是 | - |
| prompt | text | 提示词内容 | 是 | - |
| images | string[] | 图片URL数组 | 否 | [] |
| userId | number | 创建人ID | 是 | - |
| isPublic | boolean | 是否公开到广场 | 否 | false |
| likes | number | 点赞数 | 否 | 0 |
| favorites | number | 喜欢数 | 否 | 0 |
| collections | number | 收藏数 | 否 | 0 |
| createdAt | datetime | 创建时间 | 是 | 当前时间 |
| updatedAt | datetime | 更新时间 | 是 | 当前时间 |

**说明**：
- `likes`、`favorites`、`collections` 字段仅在 `isPublic = true` 时有意义
- `images` 存储为JSON数组格式
- 与 `users` 创建人和作品是一对一

#### 2. 用户收藏表 (UserCollection)
**表名**: `user_collections`

| 字段名 | 类型 | 说明 | 是否必填 | 默认值 |
|--------|------|------|----------|--------|
| id | number | 主键ID | 是 | 自增 |
| userId | number | 用户ID | 是 | - |
| creationId | number | 作品ID | 是 | - |
| createdAt | datetime | 收藏时间 | 是 | 当前时间 |

**说明**：
- 用户与作品的多对多关系中间表
- `userId` + `creationId` 建立唯一索引，防止重复收藏
- 与 `users` 表建立多对一关系
- 与 `creations` 表建立多对一关系，且仅能收藏公开作品

### API 接口设计

#### 作品相关接口
1. **POST /creations** - 创建作品
2. **GET /creations** - 分页查询作品列表（支持筛选条件）
3. **GET /creations/:id** - 获取作品详情
4. **PUT /creations/:id** - 更新作品信息
5. **DELETE /creations/:id** - 删除作品
6. **POST /creations/:id/toggle-public** - 切换作品公开状态
7. **POST /creations/:id/like** - 点赞作品
8. **POST /creations/:id/unlike** - 取消点赞
9. **GET /creations/public** - 获取公开作品广场列表

#### 收藏相关接口
1. **POST /creations/:id/collect** - 收藏作品
2. **DELETE /creations/:id/uncollect** - 取消收藏
3. **GET /users/:userId/collections** - 获取用户收藏列表

#### Coze AI 相关接口
1. **POST /creations/coze/generate-image** - 使用Coze生成图片
2. **POST /creations/coze/run-workflow** - 运行指定Coze工作流
3. **GET /creations/coze/workflow-status/:executeId** - 查询工作流执行状态
4. **POST /creations/coze/upload-file** - 上传文件到Coze
5. **GET /creations/coze/service-info** - 获取Coze服务状态

### 权限控制
1. **作品操作权限**：
   - 只有作品创建者可以编辑、删除作品
   - 只有作品创建者可以切换公开状态
   
2. **互动权限**：
   - 只能对公开作品进行点赞、收藏操作
   - 不能对自己的作品进行点赞、收藏
   
3. **查看权限**：
   - 所有用户可以查看公开作品
   - 只有创建者可以查看私有作品

4. **AI服务权限**：
   - 需要登录才能使用Coze AI功能
   - 根据用户等级限制使用次数

### 业务规则
1. **作品公开规则**：
   - 作品设为公开后，`likes`、`favorites`、`collections` 字段开始生效
   - 作品设为私有后，相关互动数据保留但不再显示
   
2. **收藏规则**：
   - 只能收藏公开的作品
   - 不能收藏自己的作品
   - 重复收藏会返回错误
   
3. **删除规则**：
   - 删除作品时同时删除相关的收藏记录
   - 软删除或硬删除根据业务需要确定

### 数据验证
1. **作品数据验证**：
   - 标题长度：1-100字符
   - 提示词长度：1-5000字符
   - 图片数量：最多10张
   - 图片URL格式验证
   
2. **查询参数验证**：
   - 分页参数：page >= 1, limit <= 100
   - 排序参数：创建时间、点赞数、收藏数等

3. **Coze参数验证**：
   - 提示词长度：1-2000字符
   - 工作流ID格式验证
   - 文件类型和大小限制

### 扩展功能（可选）
1. **标签系统**：为作品添加标签分类
2. **评论系统**：支持对公开作品进行评论
3. **举报系统**：支持举报不当内容
4. **推荐算法**：基于用户行为推荐相关作品
5. **导出功能**：支持导出作品数据

## 技术实现

### 目录结构
```
src/modules/creation/
├── README.md                 # 需求文档
├── creation.module.ts        # 模块定义
├── creation.controller.ts    # 控制器
├── creation.service.ts       # 业务逻辑服务
├── entities/
│   ├── creation.entity.ts    # 作品实体
│   └── user-collection.entity.ts # 用户收藏实体
├── dto/
│   ├── create-creation.dto.ts    # 创建作品DTO
│   ├── update-creation.dto.ts    # 更新作品DTO
│   ├── query-creation.dto.ts     # 查询作品DTO
│   ├── query-collection.dto.ts   # 查询收藏DTO
│   └── coze-generate.dto.ts      # Coze生成DTO
├── interfaces/
│   └── coze.interface.ts         # Coze接口定义
├── services/
│   └── coze.service.ts           # Coze服务
└── tests/
    ├── creation.controller.spec.ts
    ├── creation.service.spec.ts
    └── coze.service.spec.ts
```

### 依赖关系
- 依赖 `user` 模块：获取用户信息
- 依赖 `@nestjs/config`：获取环境变量配置
- 依赖 `axios`：HTTP客户端
- 依赖 `form-data`：文件上传

## 注意事项
1. 需要考虑大量数据的性能优化（分页、索引）
2. 图片存储建议使用CDN加速
3. 热门作品的缓存策略
4. 防止恶意点赞、收藏的限流机制

## Coze AI 服务集成

### 服务特性
1. **令牌管理**：自动获取和缓存访问令牌
2. **文件上传**：支持上传文件到Coze平台
3. **工作流执行**：支持运行Coze工作流进行AI生成
4. **状态查询**：支持查询异步任务执行状态
5. **错误处理**：完善的错误处理和重试机制

### 环境变量配置
需要在 `.env.local` 文件中配置以下环境变量：

```bash
# Coze API 配置
COZE_BASE_URL=https://api.coze.cn
COZE_API_KEY=your_coze_api_key_here
COZE_DEFAULT_WORKFLOW_ID=your_default_workflow_id
COZE_TIMEOUT=30000
```

### 使用示例

#### 1. 生成图片
```typescript
// 使用默认工作流生成图片
const result = await cozeService.generateImage('画一只可爱的小猫');

// 使用指定工作流生成图片
const result = await cozeService.runWorkflow('workflow_id', {
  prompt: '画一只可爱的小猫',
  style: 'cartoon'
});
```

#### 2. 文件上传
```typescript
const fileResult = await cozeService.uploadFile(
  fileBuffer,
  'image.jpg',
  'image/jpeg'
);
```

#### 3. 状态查询
```typescript
const status = await cozeService.getWorkflowStatus('execute_id');
```

### API接口
- `POST /api/v1/creations/coze/generate-image` - 图片生成
- `POST /api/v1/creations/coze/run-workflow` - 运行工作流
- `GET /api/v1/creations/coze/workflow-status/:executeId` - 查询状态
- `POST /api/v1/creations/coze/upload-file` - 文件上传
- `GET /api/v1/creations/coze/service-info` - 服务状态

### 实现细节
1. **自动令牌刷新**：服务会自动管理访问令牌的获取和刷新
2. **请求拦截器**：记录所有API请求和响应用于调试
3. **错误处理**：统一的错误处理和用户友好的错误信息
4. **配置验证**：启动时验证必要的环境变量
5. **健康检查**：提供服务状态查询接口
