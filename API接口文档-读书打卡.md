# 读书打卡功能 API 接口文档

## 基础信息

- **Base URL**: `https://nestapi.xfysj.top/xcx/api/v1`
- **认证方式**: Bearer Token (在请求头中携带 `Authorization: Bearer {token}`)
- **响应格式**: JSON
- **统一响应结构**:
```json
{
  "code": 0,        // 0 表示成功，非0表示失败
  "message": "success",
  "data": {}        // 具体数据
}
```

---

## 一、读书任务相关接口

### 1.1 获取读书任务列表

**接口地址**: `GET /reading/tasks`

**请求参数** (Query Parameters):
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | number | 否 | 页码，默认1 |
| pageSize | number | 否 | 每页数量，默认10 |
| status | string | 否 | 任务状态：pending(待开始)、in_progress(进行中)、completed(已完成) |

**请求示例**:
```
GET /reading/tasks?page=1&pageSize=100
```

**响应数据结构**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "total": 10,        // 总记录数
    "page": 1,          // 当前页码
    "pageSize": 100,    // 每页数量
    "list": [
      {
        "id": "task_123",
        "name": "英语读书打卡",
        "startDate": "2024-01-01",
        "endDate": "2024-12-31",
        "status": "in_progress",
        "totalCheckIns": 30,      // 总打卡次数（根据日期范围计算）
        "completedCheckIns": 15,  // 已完成打卡次数
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

**字段说明**:
- `status`: 任务状态
  - `pending`: 待开始（当前日期 < startDate）
  - `in_progress`: 进行中（当前日期 >= startDate 且 <= endDate）
  - `completed`: 已完成（当前日期 > endDate 或手动标记完成）
- `totalCheckIns`: 根据 startDate 和 endDate 计算的总天数
- `completedCheckIns`: 该任务下已创建的打卡记录数量

---

### 1.2 获取读书任务详情

**接口地址**: `GET /reading/tasks/:id`

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 任务ID |

**请求示例**:
```
GET /reading/tasks/task_123
```

**响应数据结构**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "task_123",
    "name": "英语读书打卡",
    "startDate": "2024-01-01",
    "endDate": "2024-12-31",
    "status": "in_progress",
    "totalCheckIns": 30,
    "completedCheckIns": 15,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### 1.3 创建读书任务

**接口地址**: `POST /reading/tasks`

**请求头**:
```
Content-Type: application/json
Authorization: Bearer {token}
```

**请求体**:
```json
{
  "name": "英语读书打卡",        // 必填，任务名称
  "startDate": "2024-01-01",    // 必填，开始日期 YYYY-MM-DD
  "endDate": "2024-12-31"       // 必填，结束日期 YYYY-MM-DD
}
```

**请求示例**:
```json
POST /reading/tasks
{
  "name": "语文读书打卡",
  "startDate": "2024-02-01",
  "endDate": "2024-02-29"
}
```

**响应数据结构**:
```json
{
  "code": 0,
  "message": "创建成功",
  "data": {
    "id": "task_124",
    "name": "语文读书打卡",
    "startDate": "2024-02-01",
    "endDate": "2024-02-29",
    "status": "pending",
    "totalCheckIns": 29,
    "completedCheckIns": 0,
    "createdAt": "2024-01-20T10:00:00.000Z",
    "updatedAt": "2024-01-20T10:00:00.000Z"
  }
}
```

**业务规则**:
- `startDate` 不能晚于 `endDate`
- 创建时 `status` 根据当前日期自动计算
- `totalCheckIns` 根据日期范围自动计算
- `completedCheckIns` 初始为 0

---

### 1.4 更新读书任务

**接口地址**: `PUT /reading/tasks/:id`

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 任务ID |

**请求头**:
```
Content-Type: application/json
Authorization: Bearer {token}
```

**请求体** (所有字段可选):
```json
{
  "name": "英语读书打卡（更新）",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31"
}
```

**响应数据结构**:
```json
{
  "code": 0,
  "message": "更新成功",
  "data": {
    "id": "task_123",
    "name": "英语读书打卡（更新）",
    "startDate": "2024-01-01",
    "endDate": "2024-12-31",
    "status": "in_progress",
    "totalCheckIns": 30,
    "completedCheckIns": 15,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-20T11:00:00.000Z"
  }
}
```

---

### 1.5 删除读书任务

**接口地址**: `DELETE /reading/tasks/:id`

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 任务ID |

**请求示例**:
```
DELETE /reading/tasks/task_123
```

**响应数据结构**:
```json
{
  "code": 0,
  "message": "删除成功",
  "data": null
}
```

**业务规则**:
- 删除任务时，建议同时删除该任务下的所有打卡记录（或标记为已删除）

---

## 二、打卡记录相关接口

### 2.1 获取打卡记录列表

**接口地址**: `GET /reading/checkins`

**请求参数** (Query Parameters):
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| taskId | string | 否 | 任务ID，筛选特定任务的打卡记录 |
| year | number | 否 | 年份，如 2024 |
| month | number | 否 | 月份，1-12 |
| page | number | 否 | 页码，默认1 |
| pageSize | number | 否 | 每页数量，默认10 |

**请求示例**:
```
GET /reading/checkins?taskId=task_123&year=2024&month=1
```

**响应数据结构**:
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": "checkin_001",
      "taskId": "task_123",
      "checkInDate": "2024-01-15",
      "audioUrl": "https://example.com/audio/xxx.mp3",
      "duration": 120,  // 录音时长（秒）
      "createdAt": "2024-01-15T08:30:00.000Z",
      "updatedAt": "2024-01-15T08:30:00.000Z"
    },
    {
      "id": "checkin_002",
      "taskId": "task_123",
      "checkInDate": "2024-01-16",
      "audioUrl": "https://example.com/audio/yyy.mp3",
      "duration": 180,
      "createdAt": "2024-01-16T09:00:00.000Z",
      "updatedAt": "2024-01-16T09:00:00.000Z"
    }
  ]
}
```

**业务规则**:
- 当提供 `taskId` 时，只返回该任务的打卡记录
- 当提供 `year` 和 `month` 时，筛选该月份的打卡记录
- 可以组合使用 `taskId`、`year`、`month` 进行精确筛选
- 返回的数组按 `checkInDate` 倒序排列（最新的在前）

---

### 2.2 创建打卡记录

**接口地址**: `POST /reading/checkins`

**请求头**:
```
Content-Type: application/json
Authorization: Bearer {token}
```

**请求体**:
```json
{
  "taskId": "task_123",           // 必填，任务ID
  "checkInDate": "2024-01-15",    // 必填，打卡日期 YYYY-MM-DD
  "audioUrl": "https://example.com/audio/xxx.mp3",  // 可选，录音文件URL
  "duration": 120                 // 可选，录音时长（秒）
}
```

**请求示例**:
```json
POST /reading/checkins
{
  "taskId": "task_123",
  "checkInDate": "2024-01-15",
  "audioUrl": "https://example.com/audio/xxx.mp3",
  "duration": 120
}
```

**响应数据结构**:
```json
{
  "code": 0,
  "message": "创建成功",
  "data": {
    "id": "checkin_001",
    "taskId": "task_123",
    "checkInDate": "2024-01-15",
    "audioUrl": "https://example.com/audio/xxx.mp3",
    "duration": 120,
    "createdAt": "2024-01-15T08:30:00.000Z",
    "updatedAt": "2024-01-15T08:30:00.000Z"
  }
}
```

**业务规则**:
- 同一个任务在同一天只能有一条打卡记录（建议后端做唯一性校验）
- 创建打卡记录后，需要更新对应任务的 `completedCheckIns` 字段
- `checkInDate` 应该在对应任务的 `startDate` 和 `endDate` 范围内

---

### 2.3 更新打卡记录

**接口地址**: `PUT /reading/checkins/:id`

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 打卡记录ID |

**请求头**:
```
Content-Type: application/json
Authorization: Bearer {token}
```

**请求体** (所有字段可选):
```json
{
  "audioUrl": "https://example.com/audio/new_xxx.mp3",
  "duration": 150
}
```

**响应数据结构**:
```json
{
  "code": 0,
  "message": "更新成功",
  "data": {
    "id": "checkin_001",
    "taskId": "task_123",
    "checkInDate": "2024-01-15",
    "audioUrl": "https://example.com/audio/new_xxx.mp3",
    "duration": 150,
    "createdAt": "2024-01-15T08:30:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

---

### 2.4 删除打卡记录

**接口地址**: `DELETE /reading/checkins/:id`

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 打卡记录ID |

**请求示例**:
```
DELETE /reading/checkins/checkin_001
```

**响应数据结构**:
```json
{
  "code": 0,
  "message": "删除成功",
  "data": null
}
```

**业务规则**:
- 删除打卡记录后，需要更新对应任务的 `completedCheckIns` 字段（减1）

---

## 三、文件上传接口

### 3.1 上传录音文件

**接口地址**: `POST /file/upload/audio`

**请求方式**: `multipart/form-data`

**请求头**:
```
Authorization: Bearer {token}
```

**请求参数** (Form Data):
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| file | File | 是 | 录音文件（支持 mp3、aac、wav 格式） |

**请求示例**:
```
POST /file/upload/audio
Content-Type: multipart/form-data
Authorization: Bearer {token}

file: [音频文件]
```

**响应数据结构**:
```json
{
  "code": 0,
  "message": "上传成功",
  "data": {
    "url": "https://example.com/audio/2024/01/15/xxx.mp3"
  }
}
```

**或者简化的响应格式**:
```json
{
  "code": 0,
  "message": "上传成功",
  "data": "https://example.com/audio/2024/01/15/xxx.mp3"
}
```

**业务规则**:
- 文件大小限制：建议不超过 10MB
- 支持格式：mp3、aac、wav
- 文件存储路径建议：`/audio/{year}/{month}/{day}/{filename}`
- 返回的 URL 应该是可以直接访问的完整 URL

---

## 四、错误码说明

| 错误码 | 说明 |
|--------|------|
| 0 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权，需要登录 |
| 403 | 无权限访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

**错误响应示例**:
```json
{
  "code": 400,
  "message": "开始日期不能晚于结束日期",
  "data": null
}
```

---

## 五、数据模型

### 5.1 读书任务表 (reading_tasks)

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| id | string | 任务ID | 主键，唯一 |
| user_id | string | 用户ID | 外键，关联用户表 |
| name | string | 任务名称 | 必填，最大长度50 |
| start_date | date | 开始日期 | 必填 |
| end_date | date | 结束日期 | 必填 |
| status | enum | 任务状态 | pending/in_progress/completed |
| total_check_ins | number | 总打卡次数 | 计算字段 |
| completed_check_ins | number | 已完成打卡次数 | 默认0 |
| created_at | datetime | 创建时间 | 自动生成 |
| updated_at | datetime | 更新时间 | 自动更新 |

**索引**:
- `user_id` 索引（用于查询用户的任务列表）
- `status` 索引（用于按状态筛选）

---

### 5.2 打卡记录表 (reading_checkins)

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| id | string | 打卡记录ID | 主键，唯一 |
| task_id | string | 任务ID | 外键，关联任务表 |
| user_id | string | 用户ID | 外键，关联用户表 |
| check_in_date | date | 打卡日期 | 必填 |
| audio_url | string | 录音文件URL | 可选 |
| duration | number | 录音时长（秒） | 可选 |
| created_at | datetime | 创建时间 | 自动生成 |
| updated_at | datetime | 更新时间 | 自动更新 |

**索引**:
- `task_id` 索引（用于查询任务的打卡记录）
- `user_id` 索引（用于查询用户的打卡记录）
- `check_in_date` 索引（用于按日期筛选）
- 唯一索引：`(task_id, check_in_date)`（确保同一任务同一天只有一条记录）

---

## 六、业务逻辑说明

### 6.1 任务状态计算

任务状态根据当前日期和任务的开始/结束日期自动计算：

```javascript
const today = new Date();
const startDate = new Date(task.startDate);
const endDate = new Date(task.endDate);

if (today < startDate) {
  status = 'pending';  // 待开始
} else if (today >= startDate && today <= endDate) {
  status = 'in_progress';  // 进行中
} else {
  status = 'completed';  // 已完成
}
```

### 6.2 总打卡次数计算

`totalCheckIns` 根据任务的开始日期和结束日期计算：

```javascript
const startDate = new Date(task.startDate);
const endDate = new Date(task.endDate);
const diffTime = endDate.getTime() - startDate.getTime();
const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
totalCheckIns = diffDays;
```

### 6.3 已完成打卡次数

`completedCheckIns` 等于该任务下已创建的打卡记录数量：

```sql
SELECT COUNT(*) FROM reading_checkins WHERE task_id = ?
```

### 6.4 打卡记录唯一性

同一个任务在同一天只能有一条打卡记录。建议在数据库层面添加唯一约束：

```sql
UNIQUE KEY `uk_task_date` (`task_id`, `check_in_date`)
```

或者在创建打卡记录时进行校验：

```sql
SELECT COUNT(*) FROM reading_checkins 
WHERE task_id = ? AND check_in_date = ?
```

如果已存在，返回错误提示。

---

## 七、接口调用示例

### 7.1 完整流程示例

**1. 创建读书任务**
```bash
POST /reading/tasks
{
  "name": "英语读书打卡",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31"
}
```

**2. 上传录音文件**
```bash
POST /file/upload/audio
Content-Type: multipart/form-data
file: [音频文件]

响应: { "code": 0, "data": "https://example.com/audio/xxx.mp3" }
```

**3. 创建打卡记录**
```bash
POST /reading/checkins
{
  "taskId": "task_123",
  "checkInDate": "2024-01-15",
  "audioUrl": "https://example.com/audio/xxx.mp3",
  "duration": 120
}
```

**4. 查询打卡记录**
```bash
GET /reading/checkins?taskId=task_123&year=2024&month=1
```

---

## 八、注意事项

1. **认证**: 所有接口都需要在请求头中携带 `Authorization: Bearer {token}`
2. **日期格式**: 所有日期字段统一使用 `YYYY-MM-DD` 格式
3. **时区**: 建议使用 UTC 时间存储，前端根据用户时区显示
4. **文件存储**: 录音文件建议存储在云存储（如 OSS、COS），并返回可访问的 URL
5. **数据校验**: 
   - 创建任务时，`startDate` 不能晚于 `endDate`
   - 创建打卡记录时，`checkInDate` 应在任务的日期范围内
   - 同一任务同一天只能有一条打卡记录
6. **性能优化**: 
   - 打卡记录列表查询建议添加分页
   - 按月份查询时，建议使用数据库索引优化
7. **数据一致性**: 
   - 创建/删除打卡记录时，需要同步更新任务的 `completedCheckIns` 字段

---

## 九、测试用例

### 9.1 创建任务测试

**正常情况**:
```json
POST /reading/tasks
{
  "name": "测试任务",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31"
}
预期: code = 0, 返回创建的任务数据
```

**异常情况**:
```json
POST /reading/tasks
{
  "name": "测试任务",
  "startDate": "2024-01-31",
  "endDate": "2024-01-01"  // 开始日期晚于结束日期
}
预期: code = 400, message = "开始日期不能晚于结束日期"
```

### 9.2 创建打卡记录测试

**正常情况**:
```json
POST /reading/checkins
{
  "taskId": "task_123",
  "checkInDate": "2024-01-15",
  "audioUrl": "https://example.com/audio/xxx.mp3",
  "duration": 120
}
预期: code = 0, 返回创建的打卡记录
```

**异常情况 - 重复打卡**:
```json
POST /reading/checkins
{
  "taskId": "task_123",
  "checkInDate": "2024-01-15"  // 该任务该日期已存在打卡记录
}
预期: code = 400, message = "该日期已打卡"
```

---

## 十、更新日志

- **v1.0.0** (2024-01-20): 初始版本，包含所有基础功能接口

