# 项目开发日志

## 2025-01-23

### AI模块新增文本处理功能

1. **功能概述**
   - 新增总结功能：对内容进行总结
   - 新增扩写功能：对内容进行扩写，使其更丰富详细
   - 新增改写功能：改写内容，支持多种风格
   - 新增生成功能：根据提示词生成对应内容

2. **API接口**
   - `POST /api/v1/ai/summarize` - 总结内容
     - 参数：content（必填）、length（可选，默认200字）、style（可选，总结风格）
   - `POST /api/v1/ai/expand` - 扩写内容
     - 参数：content（必填）、targetLength（可选，目标长度）、direction（可选，扩写方向）
   - `POST /api/v1/ai/rewrite` - 改写内容
     - 参数：content（必填）、style（可选，改写风格：formal/casual/professional/simple/elaborate）、requirements（可选，其他要求）
   - `POST /api/v1/ai/generate` - 根据提示词生成内容
     - 参数：prompt（必填）、length（可选，默认1000字）、contentType（可选，内容类型）、keywords（可选，关键词）

3. **技术实现**
   - 创建了4个新的DTO：SummarizeDto、ExpandDto、RewriteDto、GenerateDto
   - 添加了TextProcessResponse接口用于统一响应格式
   - 每个功能都使用特定的系统提示词模板
   - 所有功能都调用统一的callDoubaoAI方法

4. **使用示例**
   - 总结：传入长文本，获取简洁总结
   - 扩写：传入简短内容，获取详细扩写版本
   - 改写：传入内容，根据风格要求改写
   - 生成：传入提示词，生成对应内容

### AI模块集成火山引擎（豆包）

1. **功能概述**
   - 将AI服务从OpenAI切换为火山引擎（字节跳动）的豆包模型
   - 使用OpenAI SDK（兼容OpenAI API格式）
   - 支持多模态输入（文本和图片）
   - 使用模型：doubao-seed-1-6-flash-250828

2. **技术实现**
   - 安装 `openai` npm包
   - 修改 `AiService` 使用OpenAI SDK初始化客户端
   - 配置火山引擎的baseURL：`https://ark.cn-beijing.volces.com/api/v3`
   - 更新 `ChatDto` 支持多模态输入（文本和图片）
   - 修改 `callDoubaoAI` 方法调用火山引擎API

3. **环境变量配置**
   - `ARK_API_KEY`：火山引擎API密钥（必填）
   - `ARK_BASE_URL`：火山引擎API基础URL（默认：https://ark.cn-beijing.volces.com/api/v3）
   - `ARK_MODEL`：使用的模型名称（默认：doubao-seed-1-6-flash-250828）

4. **API变更**
   - `ChatDto.message` 现在支持两种格式：
     - 字符串格式：纯文本消息
     - 数组格式：支持图片和文本混合输入
   - 示例数组格式：
     ```json
     [
       {
         "type": "image_url",
         "image_url": {
           "url": "https://example.com/image.jpg"
         }
       },
       {
         "type": "text",
         "text": "这是哪里？"
       }
     ]
     ```

5. **代码变更**
   - 移除axios HTTP客户端，改用OpenAI SDK
   - 添加 `initializeOpenAIClient` 方法初始化客户端
   - 修改 `callDoubaoAI` 方法支持多模态输入
   - 更新错误处理和日志记录

### AI模块开发完成

1. **功能概述**
   - 创建了完整的AI模块，提供关键词搜索和AI聊天功能
   - 不需要数据库入库，只提供服务和接口
   - 支持跨模块数据搜索（用户、目标、任务、创作等）

2. **核心功能特点**
   - **关键词搜索**：支持通过关键词搜索多个模块的数据
     - 支持搜索类型：all（全部）、user（用户）、target（目标）、task（任务）、creation（创作）
     - 支持分页查询
     - 返回统一格式的搜索结果
   - **AI聊天**：集成AI服务进行智能对话
     - 支持对话历史记录
     - 支持自定义系统提示词
     - 可配置AI服务提供商（目前支持OpenAI）
     - 支持环境变量配置AI服务参数

3. **技术实现**
   - 创建 `AiModule`、`AiService`、`AiController`
   - 创建 `SearchKeywordDto` 和 `ChatDto` 数据传输对象
   - 使用TypeORM Repository进行跨模块数据查询
   - 使用axios进行AI服务API调用
   - 支持多种AI服务提供商（通过环境变量配置）
   - 在 `app.module.ts` 中注册AI模块

4. **API接口**
   - `GET /api/v1/ai/search`：关键词搜索接口
     - 参数：keyword（必填）、type（可选，默认all）、pageIndex（可选）、pageSize（可选）
   - `POST /api/v1/ai/chat`：AI聊天接口
     - 参数：message（必填）、history（可选）、systemPrompt（可选）

5. **环境变量配置**
   - `AI_PROVIDER`：AI服务提供商（默认：openai）
   - `AI_API_KEY`：AI服务API密钥（必填）
   - `AI_API_BASE`：AI服务API基础URL（可选）
   - `AI_MODEL`：AI模型名称（默认：gpt-3.5-turbo）

6. **模块结构**
   ```
   ai/
   ├── dto/
   │   ├── search-keyword.dto.ts
   │   └── chat.dto.ts
   ├── ai.controller.ts
   ├── ai.service.ts
   └── ai.module.ts
   ```

## 2025-01-23

### 移除User实体中的targets字段

1. **功能概述**
   - 从 `User` 实体中移除了 `targets` 字段（`@OneToMany` 关系）
   - 该字段不是必需的，用户和目标的关系通过 `Target` 实体中的 `user` 字段（`@ManyToOne`）管理即可
   - 更新了 `user.service.ts` 中的 `remove` 方法，改为通过 `TargetRepository` 查询用户的目标

2. **技术实现**
   - 修改 `user.entity.ts`：移除 `targets` 字段和相关的 `@OneToMany` 装饰器，移除 `Target` 实体的导入
   - 修改 `target.entity.ts`：更新 `@ManyToOne` 装饰器，移除反向关系参数 `user => user.targets`
   - 更新 `user.service.ts`：
     - 注入 `TargetRepository` 替代 `TargetService`
     - 修改 `remove` 方法，通过 `targetRepository.find` 查询用户的所有目标
   - 更新 `user.module.ts`：添加 `Target` 实体到 `TypeOrmModule.forFeature`

3. **关系说明**
   - 关系类型：多对一（Many-to-One）
   - 一个用户可以有多个目标（User 1 -> N Target）
   - 一个目标只能属于一个用户（Target N -> 1 User）
   - 关系只在 `Target` 实体中定义，通过 `userId` 字段关联

### 用户目标关系修正为多对一关系

1. **功能概述**
   - 将用户和目标的关系从多对多改为多对一关系
   - 一个目标只能属于一个用户，一个用户可以有多个目标
   - 在 `targets` 表中使用 `userId` 字段直接关联用户
   - 删除用户时，可以通过级联删除处理关联的目标

2. **技术实现**
   - 修改 `user.entity.ts`：将 `@ManyToMany` 改为 `@OneToMany`，移除 `@JoinTable` 装饰器
   - 修改 `target.entity.ts`：将 `@ManyToMany` 改为 `@ManyToOne`，使用 `@JoinColumn` 配置 `userId` 字段
   - 更新 `target.service.ts`：修改 `create` 方法，使用 `target.user = user` 而不是 `target.users = [user]`
   - 更新 `target.service.ts`：修改 `summary` 方法中的查询，使用 `user: { id: userId }` 查询用户的目标

3. **数据库变更**
   - 移除中间表 `user_targets`（如果存在）
   - 在 `targets` 表中添加 `userId` 字段作为外键关联 `user` 表
   - 删除用户时，需要处理关联的目标（级联删除或设置为null，取决于业务需求）

4. **关系说明**
   - 关系类型：多对一（Many-to-One）
   - 一个用户可以有多个目标（User 1 -> N Target）
   - 一个目标只能属于一个用户（Target N -> 1 User）

## 2025-01-22

### 微信小程序多账号支持

1. **功能概述**
   - 实现了微信小程序多账号管理功能
   - 使用字典模块存储多个微信小程序账号配置
   - 支持通过accountId选择不同的账号进行登录

2. **技术实现**
   - 在字典表中存储微信账号配置，category为"wechat"，name为"wechat_mini_program_account"
   - value字段存储JSON数组，包含每个账号的appId、appSecret、name和id（UUID）
   - 修改AuthModule导入DictionaryModule
   - 在AuthService中注入DictionaryService
   - 添加getWechatAccountConfig私有方法来获取微信配置
   - 修改wechatLogin方法支持accountId参数
   - 修改getAccessToken方法支持accountId参数
   - 更新WechatLoginDto添加accountId字段

3. **数据格式**
   ```json
   [
     {
       "appId": "wx7b46ef7bc61b7123",
       "appSecret": "623c3abd21a49243ec3e3751079122e6",
       "name": "早安",
       "id": "550e8400-e29b-41d4-a716-446655440000"
     },
     {
       "appId": "wxb2d970f22a47cea1",
       "appSecret": "75fedea525ed1f649d165e03a58b9293",
       "name": "小飞鱼工作室",
       "id": "660e8400-e29b-41d4-a716-446655440001"
     }
   ]
   ```

4. **API变更**
   - WechatLoginDto添加accountId字段（可选）
   - wechatLogin方法支持根据accountId选择账号，如果不提供则使用第一个账号
   - getAccessToken方法支持accountId参数

5. **使用说明**
   - 登录时可通过accountId参数指定使用哪个账号
   - 如果不提供accountId，默认使用第一个账号
   - 所有账号信息存储在字典表中，便于管理

