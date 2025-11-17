# 字典模块

## 概述

字典模块提供了系统字典数据的管理功能，支持按分类组织字典项，并提供灵活的查询接口。

## 功能特性

- **字典管理**：支持字典项的创建、编辑、删除、查看
- **分类管理**：按分类组织字典项，便于管理
- **灵活查询**：支持按分类查询列表，按分类+名称查询单个字典
- **排序支持**：支持按权重排序，便于字典项的管理
- **状态管理**：支持字典项的启用/禁用管理

## 数据模型

### Dictionary 实体

| 字段 | 类型 | 说明 | 必填 |
|------|------|------|------|
| id | number | 主键ID | 是 |
| category | string | 字典分类 | 是 |
| name | string | 字典名称 | 是 |
| value | string | 字典值 | 是 |
| sort | number | 排序权重 | 否 |
| isEnabled | boolean | 是否启用 | 否 |
| remark | string | 备注 | 否 |
| createdAt | Date | 创建时间 | 是 |
| updatedAt | Date | 更新时间 | 是 |

## API 接口

### 1. 创建字典

**POST** `/api/v1/dictionary`

**请求参数：**
```json
{
  "category": "system",
  "name": "status",
  "value": "active",
  "sort": 0,
  "isEnabled": true,
  "remark": "系统状态"
}
```

**响应：**
```json
{
  "id": 1,
  "category": "system",
  "name": "status",
  "value": "active",
  "sort": 0,
  "isEnabled": true,
  "remark": "系统状态",
  "createdAt": "2025-01-22T10:00:00.000Z",
  "updatedAt": "2025-01-22T10:00:00.000Z"
}
```

### 2. 分页查询字典列表

**GET** `/api/v1/dictionary?page=1&pageSize=10&category=system&name=status`

**响应：**
```json
{
  "total": 100,
  "page": 1,
  "pageSize": 10,
  "list": [
    {
      "id": 1,
      "category": "system",
      "name": "status",
      "value": "active",
      "sort": 0,
      "isEnabled": true,
      "remark": "系统状态",
      "createdAt": "2025-01-22T10:00:00.000Z",
      "updatedAt": "2025-01-22T10:00:00.000Z"
    }
  ]
}
```

### 3. 根据分类获取字典列表

**GET** `/api/v1/dictionary/category/system`

**响应：**
```json
[
  {
    "id": 1,
    "category": "system",
    "name": "status",
    "value": "active",
    "sort": 0,
    "isEnabled": true,
    "remark": "系统状态",
    "createdAt": "2025-01-22T10:00:00.000Z",
    "updatedAt": "2025-01-22T10:00:00.000Z"
  }
]
```

### 4. 根据分类和名称获取字典

**GET** `/api/v1/dictionary/category/system/name/status`

**响应：**
```json
{
  "id": 1,
  "category": "system",
  "name": "status",
  "value": "active",
  "sort": 0,
  "isEnabled": true,
  "remark": "系统状态",
  "createdAt": "2025-01-22T10:00:00.000Z",
  "updatedAt": "2025-01-22T10:00:00.000Z"
}
```

### 5. 更新字典

**PUT** `/api/v1/dictionary/1`

**请求参数：**
```json
{
  "value": "inactive",
  "sort": 1
}
```

### 6. 删除字典

**DELETE** `/api/v1/dictionary/1`

### 7. 获取所有分类

**GET** `/api/v1/dictionary/categories/list`

**响应：**
```json
["system", "user", "order"]
```

## 使用示例

### 创建系统状态字典

```bash
curl -X POST http://localhost:3000/api/v1/dictionary \
  -H "Content-Type: application/json" \
  -d '{
    "category": "system",
    "name": "status",
    "value": "active",
    "sort": 0,
    "isEnabled": true,
    "remark": "系统状态"
  }'
```

### 查询系统分类的字典列表

```bash
curl -X GET "http://localhost:3000/api/v1/dictionary/category/system"
```

### 查询特定的字典项

```bash
curl -X GET "http://localhost:3000/api/v1/dictionary/category/system/name/status"
```

## 注意事项

1. **必填字段**：创建字典时，`category` 和 `name` 为必填字段
2. **唯一性**：同一分类下的字典名称应该保持唯一
3. **启用状态**：只有启用的字典项才会在查询结果中返回
4. **排序**：字典项按 `sort` 字段降序排列，相同排序值的按创建时间降序排列
5. **权限控制**：所有字典接口都无需权限验证，可直接访问 