# 用户打卡模块（userAction）

## 模块简介
本模块用于实现用户每日打卡功能。每个用户每天可打卡两次，分别为早上和晚上。每次打卡需记录打卡时间。

## 主要功能
- 用户每日可进行两次打卡：早上一次、晚上一次。
- 每次打卡需记录打卡的具体时间。
- 支持查询用户某日的打卡记录。

## 目录结构

- `dto/` 数据传输对象目录，包含请求和响应DTO。
  - `check-in.dto.ts` 打卡请求DTO
  - `user-action-record.dto.ts` 打卡记录DTO
- `entities/` 实体目录，包含数据库实体定义。
  - `user-action.entity.ts` 用户打卡记录实体
- `tests/` 测试目录，包含单元测试和接口测试。
  - `user-action.service.spec.ts` 服务单元测试
  - `user-action.controller.spec.ts` 控制器单元测试
- `user-action.module.ts` 模块注册文件
- `user-action.service.ts` 服务文件
- `user-action.controller.ts` 控制器文件
- `readme.md` 模块说明文档

## 设计说明
- 每个用户每天最多只能打卡两次，分别为早晚各一次。
- 打卡类型（morning/early, evening/late）可通过接口参数指定。
- 打卡记录需包含用户ID、打卡类型、打卡时间。
- 目前数据存储为内存数组，后续可扩展为数据库持久化。

## 主要文件说明
- `CheckInDto`：打卡请求数据结构，包含用户ID、打卡类型、打卡时间，带有class-validator校验。
- `UserActionRecordDto`：打卡记录数据结构，包含记录ID、用户ID、打卡类型、打卡时间、日期。
- `UserActionEntity`：数据库实体，持久化打卡记录。
- `UserActionService`：实现打卡和查询逻辑，防止重复打卡。
- `UserActionController`：提供打卡和查询接口。

## 测试覆盖
- 已为服务和控制器编写单元测试，覆盖打卡、重复打卡校验、记录查询等核心逻辑。

## 相关接口
- `POST /user-action/check-in` 用户打卡接口
- `GET /user-action/records` 查询打卡记录接口

## 标准化说明

本模块已严格对齐user模块开发模板（templage.md）：
- 目录结构清晰，DTO、实体、控制器、服务、模块注册分离。
- 实体、DTO、控制器、服务均加JSDoc中文注释。
- 所有DTO和实体字段均加@ApiProperty注解，便于Swagger文档自动生成。
- type字段类型与CheckInType枚举强类型绑定，提升类型安全。
- 模块注册已集成TypeOrmModule，便于数据库持久化。
- 控制器接口加Swagger装饰器，接口文档自动化。
- 依赖注入、异常处理、命名规范、测试结构均与user模块一致。

如需新建其他模块，请严格参考本模块和user模块模板。

---
如需修改或扩展功能，请遵循本模块设计规范。 