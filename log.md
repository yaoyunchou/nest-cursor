# 变更日志

## 2025-01-23（晚上 - 修复数据库连接重置错误）

### 优化数据库连接池配置

1. **问题描述**
   - 错误信息：`QueryFailedError: read ECONNRESET`
   - 原因：数据库连接被重置，通常是由于连接超时、连接池配置不当或长时间空闲连接被数据库服务器关闭

2. **修复内容**
   - 文件：`src/app.module.ts`
   - 在 TypeORM 配置中添加了 `extra` 选项，配置 MySQL 连接池参数：
     - `connectionLimit: 10` - 连接池最大连接数
     - `connectTimeout: 60000` - 连接超时时间（60秒）
     - `acquireTimeout: 60000` - 获取连接超时时间（60秒）
     - `timeout: 60000` - 查询超时时间（60秒）
     - `reconnect: true` - 启用自动重连
     - `idleTimeout: 300000` - 空闲连接超时时间（5分钟）
     - `maxIdle: 10` - 最大空闲连接数
     - `enableKeepAlive: true` - 启用保持连接活跃
     - `keepAliveInitialDelay: 0` - 保持连接初始延迟

3. **技术实现细节**
   - 使用 `extra` 选项传递 MySQL2 连接池配置
   - 这些配置会传递给底层的 mysql2 驱动
   - 提高连接稳定性和自动恢复能力

4. **影响范围**
   - 提高数据库连接的稳定性
   - 减少连接重置错误
   - 自动处理连接超时和重连

## 2025-01-23（晚上 - 移除读书打卡唯一性约束）

### 允许同一日期多次打卡

1. **功能变更**
   - 移除了打卡记录的唯一性约束
   - 允许同一任务在同一日期创建多条打卡记录

2. **修改内容**
   - **实体** (`src/modules/reading/entities/reading-checkin.entity.ts`)：
     - 移除了 `@Unique(['task', 'checkInDate'])` 装饰器
     - 移除了 `Unique` 的导入
   - **服务** (`src/modules/reading/reading-checkin.service.ts`)：
     - 移除了检查已存在打卡记录的逻辑
     - 移除了唯一索引冲突的错误处理
     - 简化了创建逻辑

3. **注意事项**
   - 如果数据库中已存在唯一索引，需要手动删除：
     ```sql
     ALTER TABLE reading_checkins DROP INDEX <索引名称>;
     ```
   - 如果 TypeORM 的 `synchronize` 为 `true`，重启应用后会自动同步数据库结构

## 2025-01-23（晚上 - 还原音频合并相关DTO文件）

### 还原被误删的DTO文件

1. **问题描述**
   - 用户不小心删除了两个DTO文件：
     - `src/modules/file/dto/merge-audio-by-url.dto.ts`
     - `src/modules/file/dto/upload-audio-merge.dto.ts`

2. **还原内容**
   - **MergeAudioByUrlDto** (`src/modules/file/dto/merge-audio-by-url.dto.ts`)：
     - 用于通过七牛云URL合并音频文件的DTO
     - 包含 `urls: string[]` 字段
     - 验证规则：数组长度2-21，每个元素必须是有效的URL
     - 使用 `@IsArray()`、`@ArrayMinSize(2)`、`@ArrayMaxSize(21)`、`@IsUrl({ each: true })` 进行验证
   - **UploadAudioMergeDto** (`src/modules/file/dto/upload-audio-merge.dto.ts`)：
     - 用于上传并合并音频文件的DTO
     - 包含 `files: Express.Multer.File[]` 字段
     - 支持1-21个音频文件上传

3. **文件用途**
   - `MergeAudioByUrlDto` 在 `file.controller.ts` 的 `mergeAudioByUrls` 接口中使用
   - `UploadAudioMergeDto` 已导入但当前使用内联 schema，保留以保持代码一致性

## 2025-01-23（晚上 - 读书打卡模块支持多段录音URL）

### 为打卡记录添加 audioUrlList 字段支持

1. **功能说明**
   - 在创建和更新打卡记录时，支持传入多个录音文件URL
   - 新增 `audioUrlList` 字段，用于接收多段原始录音数据
   - 保持向后兼容，原有的 `audioUrl` 字段仍然可用

2. **实现内容**
   - **CreateReadingCheckinDto** (`src/modules/reading/dto/create-reading-checkin.dto.ts`)：
     - 新增 `audioUrlList?: string[]` 字段
     - 添加数组验证：至少包含一个URL，每个元素必须是有效的URL
     - 使用 `@IsArray()`、`@ArrayMinSize()`、`@IsUrl({ each: true })` 进行验证
   - **UpdateReadingCheckinDto** (`src/modules/reading/dto/update-reading-checkin.dto.ts`)：
     - 同样添加 `audioUrlList?: string[]` 字段
     - 保持与创建DTO的一致性
   - **ReadingCheckinService** (`src/modules/reading/reading-checkin.service.ts`)：
     - 在 `create()` 方法中：优先使用 `audioUrlList`，如果提供则序列化为JSON字符串存储到 `audioUrl` 字段
     - 在 `update()` 方法中：同样优先处理 `audioUrlList`
     - 保持向后兼容：如果没有 `audioUrlList`，则使用原有的 `audioUrl` 字段

3. **技术实现细节**
   - 使用 JSON 序列化将 URL 数组存储到数据库的 `audioUrl` 字段（字符串类型）
   - 验证规则：数组至少包含1个元素，每个元素必须是有效的URL
   - 优先级：`audioUrlList` > `audioUrl`（如果同时提供，优先使用 `audioUrlList`）

4. **使用示例**
   ```json
   {
     "taskId": 1,
     "checkInDate": "2024-01-15",
     "audioUrlList": [
       "https://example.com/audio/xxx1.mp3",
       "https://example.com/audio/xxx2.mp3"
     ],
     "duration": 120
   }
   ```

5. **影响范围**
   - 不影响现有功能，保持向后兼容
   - 数据库结构无需修改（使用JSON字符串存储）
   - API接口自动支持新字段，Swagger文档会自动更新

## 2025-01-23（晚上 - 创建 plink.exe 自动下载脚本）

### 创建 plink.exe 下载工具

1. **问题描述**
   - 用户只有 `putty.exe`，没有 `plink.exe` 文件
   - `plink.exe` 是 PuTTY 的命令行工具，用于脚本自动化
   - 需要手动下载 plink.exe 才能使用部署脚本

2. **解决方案**
   - 创建了 `download-plink.bat` 脚本
   - 自动从 PuTTY 官网下载 plink.exe
   - 下载到 `E:\runjian\` 目录（与 putty.exe 同目录）
   - 使用 PowerShell 的 `Invoke-WebRequest` 下载文件

3. **脚本功能**
   - 自动检查目标目录是否存在，不存在则创建
   - 检查 plink.exe 是否已存在，避免重复下载
   - 提供下载进度和结果反馈
   - 下载失败时提供手动下载指引

4. **使用方法**
   - 直接运行 `download-plink.bat` 即可自动下载
   - 下载完成后，`upload.bat` 脚本会自动检测并使用

5. **优化 upload.bat**
   - 更新了错误提示信息
   - 添加了运行 `download-plink.bat` 的提示
   - 提供更友好的用户指引

## 2025-01-23（晚上 - 优化 upload.bat 脚本支持指定路径的 plink.exe）

### 优化部署脚本的 plink 工具检测逻辑

1. **问题描述**
   - 用户安装的 PuTTY 在 `E:\runjian\putty.exe`
   - 原脚本只检查系统 PATH 中的 plink，无法使用指定路径的 plink.exe
   - `plink.exe` 通常与 `putty.exe` 在同一目录下

2. **修复内容**
   - 文件：`upload.bat`
   - 变更内容：
     - 优先检查 `E:\runjian\plink.exe` 是否存在
     - 如果存在，直接使用完整路径
     - 如果不存在，再检查系统 PATH 中的 plink
     - 使用 `PLINK_PATH` 变量存储 plink 的路径
     - 在执行命令时使用 `"%PLINK_PATH%"` 确保路径正确

3. **技术实现细节**
   - 使用 `if exist` 检查指定路径的文件是否存在
   - 使用 `where plink` 检查系统 PATH 中的 plink
   - 使用引号包裹路径变量，避免路径中包含空格时出错
   - 提供清晰的错误提示，指导用户如何解决问题

4. **影响范围**
   - 脚本现在可以自动检测并使用 `E:\runjian\plink.exe`
   - 如果指定路径不存在，会自动回退到系统 PATH 中的 plink
   - 提高了脚本的灵活性和兼容性

## 2025-01-23（晚上 - 添加 plink.exe 到系统 PATH 配置脚本）

### 创建 PATH 环境变量配置工具

1. **功能说明**
   - 创建了用于将 `plink.exe` 所在目录添加到系统 PATH 环境变量的工具脚本
   - 支持通过批处理文件或 PowerShell 脚本两种方式配置
   - 文件位置：`E:\runjian\plink.exe`

2. **实现内容**
   - **批处理脚本** (`add-plink-to-path.bat`)：
     - 自动检查目录和文件是否存在
     - 使用 PowerShell 以管理员权限添加 PATH
     - 提供友好的中文提示信息
   - **PowerShell 脚本** (`add-plink-to-path.ps1`)：
     - 完整的 PATH 添加逻辑
     - 检查是否已存在，避免重复添加
     - 详细的错误处理和提示信息

3. **使用方法**
   - 方法一：右键以管理员身份运行 `add-plink-to-path.bat`
   - 方法二：以管理员身份运行 PowerShell，执行 `add-plink-to-path.ps1`
   - 方法三：通过系统环境变量设置界面手动添加

4. **注意事项**
   - 需要管理员权限才能修改系统 PATH
   - 修改后需要重新打开命令行窗口才能生效
   - 脚本会自动检查路径是否已存在，避免重复添加

## 2025-01-23（晚上 - 新增通过URL合并音频文件功能）

### 新增通过七牛云URL合并音频文件接口

1. **功能说明**
   - 新增接口：`POST /api/v1/file/audio/merge-by-url`
   - 支持通过传入七牛云文件URL数组直接合并音频文件
   - 无需重新上传文件，直接使用已存在的文件进行合并

2. **实现内容**
   - **QiniuService** (`src/modules/file/qiniu.service.ts`)：
     - 新增 `extractKeyFromUrl()` 方法：从七牛云URL中提取文件key
     - 支持多种七牛云URL格式，自动处理查询参数和hash
   - **FileService** (`src/modules/file/file.service.ts`)：
     - 新增 `mergeAudioByUrls()` 方法：通过URL数组合并音频文件
     - 自动从URL中提取key，调用七牛云合并接口
     - 轮询等待合并完成，最多等待60秒
   - **FileController** (`src/modules/file/file.controller.ts`)：
     - 新增 `mergeAudioByUrls()` 接口端点
     - 使用 `MergeAudioByUrlDto` 进行参数验证
   - **DTO** (`src/modules/file/dto/merge-audio-by-url.dto.ts`)：
     - 创建 `MergeAudioByUrlDto` 类
     - 验证URL数组格式和数量（2-21个）

3. **技术实现细节**
   - 七牛云 `avconcat` 接口要求所有源文件必须位于同一存储空间
   - 从URL中提取key时，自动处理域名匹配和路径解析
   - 支持带查询参数和hash的URL，自动清理后提取key
   - 合并过程与文件上传方式相同，使用相同的轮询机制

4. **使用限制**
   - 文件数量：2-21个URL
   - 所有文件必须位于同一七牛云存储空间
   - URL必须是有效的七牛云文件URL
   - 需要JWT认证

5. **文档更新**
   - 更新 `doc/audio-merge-api-examples.md`，添加URL合并方式的详细示例
   - 包含cURL、JavaScript、Axios、Postman等多种使用方式

## 2025-01-23（晚上 - 修复七牛云音频合并功能）

### 修复七牛云 pfop 方法调用错误

1. **问题描述**
   - 错误信息：`Property 'pfop' does not exist on type 'BucketManager'`
   - 原因：`pfop`（持久化处理）方法应该使用 `OperationManager` 而不是 `BucketManager`
   - 位置：`src/modules/file/qiniu.service.ts` 第125行

2. **修复内容**
   - 将 `BucketManager` 改为 `OperationManager` 来执行 `pfop` 操作
   - 修正 `pfop` 方法的参数结构：
     - `pipeline` 作为单独参数传递
     - `notifyURL` 和其他选项放在 `PfopOptions` 对象中传递
   - 文件：`src/modules/file/qiniu.service.ts`
   - 变更内容：
     - 使用 `qiniu.fop.OperationManager` 替代 `qiniu.rs.BucketManager`
     - 将 `notifyURL` 参数改为 `PfopOptions` 对象格式
     - 保持其他业务逻辑不变

3. **技术实现细节**
   - `OperationManager` 是七牛云 SDK 中专门用于持久化处理操作的类
   - `pfop` 方法签名：`pfop(bucket: string, key: string, fops: string[], pipeline: string, options: PfopOptions | null, callback)`
   - `PfopOptions` 接口包含：`notifyURL`、`force`、`type`、`workflowTemplateID` 等可选字段

4. **影响范围**
   - 修复了音频合并功能的编译错误
   - `concatAudio` 方法现在可以正常调用七牛云的音频合并服务
   - 不影响其他文件上传、删除等功能

## 2025-01-23（晚上 - 新增读书打卡模块）

### 读书打卡功能模块开发完成

1. **模块概述**
   - 实现了完整的读书打卡功能模块
   - 支持读书任务的创建、查询、更新、删除
   - 支持打卡记录的创建、查询、更新、删除
   - 实现了任务状态自动计算、打卡次数统计等业务逻辑

2. **核心功能特点**
   - **任务管理**：支持创建读书任务，设置开始和结束日期，自动计算任务状态和总打卡次数
   - **打卡记录**：支持创建打卡记录，记录打卡日期、录音文件URL和时长
   - **状态计算**：任务状态根据当前日期自动计算（pending/in_progress/completed）
   - **次数统计**：自动计算总打卡次数和已完成打卡次数
   - **唯一性校验**：同一任务同一天只能有一条打卡记录
   - **日期验证**：打卡日期必须在任务日期范围内

3. **技术实现亮点**
   - 使用TypeORM实现数据持久化
   - 实现了任务和打卡记录的一对多关联
   - 使用数据库唯一索引确保打卡记录唯一性
   - 实现了自动更新任务已完成打卡次数的逻辑
   - 支持按任务、年份、月份筛选打卡记录
   - 完整的JWT认证和权限控制

4. **数据模型设计**
   - **ReadingTask实体**：读书任务表，包含任务名称、开始日期、结束日期、状态、总打卡次数、已完成打卡次数等字段
   - **ReadingCheckin实体**：打卡记录表，包含任务ID、用户ID、打卡日期、录音文件URL、录音时长等字段
   - 建立了任务和打卡记录的一对多关系
   - 建立了任务和用户的多对一关系
   - 建立了打卡记录和用户的多对一关系

5. **API接口设计**
   - **读书任务接口**：
     - `POST /reading/tasks`：创建读书任务
     - `GET /reading/tasks`：获取任务列表（支持分页和状态筛选）
     - `GET /reading/tasks/:id`：获取任务详情
     - `PUT /reading/tasks/:id`：更新任务
     - `DELETE /reading/tasks/:id`：删除任务
   - **打卡记录接口**：
     - `POST /reading/checkins`：创建打卡记录
     - `GET /reading/checkins`：获取打卡记录列表（支持按任务、年份、月份筛选和分页）
     - `GET /reading/checkins/:id`：获取打卡记录详情
     - `PUT /reading/checkins/:id`：更新打卡记录
     - `DELETE /reading/checkins/:id`：删除打卡记录

6. **业务逻辑实现**
   - **任务状态计算**：根据当前日期和任务的开始/结束日期自动计算状态
     - `pending`：当前日期 < 开始日期
     - `in_progress`：开始日期 <= 当前日期 <= 结束日期
     - `completed`：当前日期 > 结束日期
   - **总打卡次数计算**：根据任务的开始日期和结束日期计算总天数
   - **已完成打卡次数**：统计该任务下已创建的打卡记录数量
   - **打卡记录唯一性**：使用数据库唯一索引确保同一任务同一天只有一条记录
   - **数据一致性**：创建/删除打卡记录时自动更新任务的已完成打卡次数

7. **文件结构**
   - `src/modules/reading/entities/`：实体定义
     - `reading-task.entity.ts`：读书任务实体
     - `reading-checkin.entity.ts`：打卡记录实体
   - `src/modules/reading/dto/`：数据传输对象
     - `create-reading-task.dto.ts`：创建任务DTO
     - `update-reading-task.dto.ts`：更新任务DTO
     - `query-reading-task.dto.ts`：查询任务DTO
     - `create-reading-checkin.dto.ts`：创建打卡记录DTO
     - `update-reading-checkin.dto.ts`：更新打卡记录DTO
     - `query-reading-checkin.dto.ts`：查询打卡记录DTO
   - `src/modules/reading/`：服务层和控制器
     - `reading-task.service.ts`：任务服务
     - `reading-checkin.service.ts`：打卡记录服务
     - `reading-task.controller.ts`：任务控制器
     - `reading-checkin.controller.ts`：打卡记录控制器
     - `reading.module.ts`：模块定义

8. **在AppModule中注册模块**
   - 文件：`src/app.module.ts`
   - 添加了`ReadingModule`到imports数组

## 2025-01-23（晚上 - 禁用 Jest 自动运行）

### 禁用 VS Code Jest 扩展的自动运行功能

1. **问题描述**
   - 每次打开控制台时，Jest 都会自动运行测试
   - 影响开发体验，占用系统资源

2. **解决方案**
   - 文件：`.vscode/settings.json`
   - 变更：添加 Jest 扩展配置，禁用自动运行
   - 配置项：
     - `jest.autoRun: "off"` - 禁用自动运行
     - `jest.runMode: "on-demand"` - 设置为按需运行模式
   - 效果：Jest 测试将不再自动运行，需要手动触发

3. **影响范围**
   - Jest 测试不会在打开控制台时自动运行
   - 可以通过命令面板或测试文件中的运行按钮手动执行测试
   - 不影响 `npm test` 等命令行测试命令

## 2025-01-23（晚上 - 优化 @nestjs/schedule 配置）

### 优化定时任务模块配置

1. **将 ScheduleModule 移到应用根模块**
   - 文件：`src/app.module.ts`
   - 变更：在 `AppModule` 中导入 `ScheduleModule.forRoot()`
   - 原因：`ScheduleModule.forRoot()` 应该在应用根模块中导入一次，而不是在子模块中重复导入
   - 好处：
     - 避免重复初始化
     - 统一管理所有定时任务
     - 符合 NestJS 最佳实践

2. **从子模块中移除 ScheduleModule**
   - 文件：`src/modules/notification-task/notification-task.module.ts`
   - 变更：移除 `ScheduleModule.forRoot()` 的导入和使用
   - 原因：已在根模块中统一管理

3. **添加调度服务启动日志**
   - 文件：`src/modules/notification-task/services/notification-scheduler.service.ts`
   - 变更：
     - 实现 `OnModuleInit` 接口
     - 在 `onModuleInit()` 方法中记录启动日志
   - 效果：应用启动时可以确认定时任务服务已正确启动

4. **技术实现细节**
   - 使用 `OnModuleInit` 生命周期钩子确保服务初始化完成
   - 启动日志帮助监控和调试定时任务
   - 保持代码结构清晰，符合单一职责原则

5. **影响范围**
   - 定时任务功能不受影响，仍然每分钟检查一次待执行的任务
   - 代码结构更加规范，便于维护和扩展
   - 启动日志便于确认服务状态

## 2025-01-23（晚上 - Jest环境变量配置）

### 配置Jest测试环境支持读取.env文件

1. **创建Jest设置文件**
   - 文件：`jest.setup.ts`
   - 功能：在测试运行前自动加载 `.env.local` 和 `.env` 文件中的环境变量
   - 实现：使用Node.js内置的`fs`和`path`模块解析.env文件
   - 特性：
     - 支持注释行（以#开头）
     - 支持带引号的值（自动移除引号）
     - 按优先级加载（.env.local 优先于 .env）
     - 不覆盖已存在的环境变量

2. **更新Jest配置**
   - 文件：`package.json`
   - 变更：在Jest配置中添加`setupFilesAfterEnv`选项
   - 配置：`"setupFilesAfterEnv": ["../jest.setup.ts"]`
   - 作用：确保在运行测试前先加载环境变量

3. **优化测试文件环境变量处理**
   - 文件：`src/modules/notification-task/notifiers/feishu.notifier.spec.ts`
   - 变更：
     - 在`beforeEach`中保存原始环境变量（可能来自.env文件）
     - 设置测试专用的环境变量值（确保测试结果可预测）
     - 在`afterEach`中恢复原始环境变量（包括从.env文件加载的值）
   - 效果：测试既可以使用.env文件中的真实配置，也可以使用测试默认值

4. **技术实现细节**
   - 使用`process.cwd()`获取项目根目录
   - 解析.env文件格式：`KEY=VALUE`
   - 支持单引号和双引号包裹的值
   - 忽略空行和注释行
   - 文件不存在时静默处理（不影响测试运行）

5. **影响范围**
   - 所有Jest单元测试现在都可以读取.env文件中的环境变量
   - 测试文件可以优先使用.env文件中的配置，如果没有则使用测试默认值
   - 提高了测试的灵活性和可配置性

## 2025-01-23（晚上 - 测试修复）

### 修复单元测试中的多个问题

1. **CreationController测试修复**
   - 问题：缺少CozeService依赖注入
   - 修复：在测试模块中添加CozeService的mock提供者
   - 文件：`src/modules/creation/tests/creation.controller.spec.ts`

2. **UserActionService测试修复**
   - 问题：测试使用了过去的日期，但代码要求打卡日期必须是今天
   - 修复：使用dayjs获取今天的日期，并正确设置所有mock返回值
   - 文件：`src/modules/userAction/tests/user-action.service.spec.ts`

3. **UserService测试修复**
   - 问题：getManyAndCount mock设置方式不一致
   - 修复：统一使用`jest.fn().mockResolvedValue()`方式设置mock
   - 文件：`src/modules/user/user.service.spec.ts`

4. **测试修复总结**
   - 修复了10个测试套件中的编译错误和运行时错误
   - 所有修复遵循AAA测试模式（安排-行动-断言）
   - 确保mock数据格式与实际返回格式一致

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

