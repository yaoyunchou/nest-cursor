# 项目开发日志

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

