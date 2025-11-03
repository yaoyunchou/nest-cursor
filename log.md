# 项目开发日志

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

