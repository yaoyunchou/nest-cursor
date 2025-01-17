# 学习笔记

在 NestJS 中，Filters 和 Interceptors 有不同的职责和执行时机：

## 核心组件说明

1. **Interceptors（拦截器）**

   - 作用：处理正常的请求响应流程
   - 时机：在请求处理的前后执行
   - 用途：
     - 转换响应结果
     - 添加响应头
     - 处理超时
     - 缓存响应
     - 日志记录

2. **Filters（过滤器）**

   - 作用：处理异常情况
   - 时机：在发生异常时执行
   - 用途：
     - 统一异常处理
     - 格式化错误响应
     - 异常日志记录
     - 自定义错误处理

3. **统一响应格式**

   ```typescript
   // 成功响应格式
   {
     code: 0,
     message: "操作成功",
     data: any,
     path: string,
     timestamp: number
   }

   // 错误响应格式
   {
     code: number,
     message: string,
     data: null,
     path: string,
     timestamp: number
   }
   ```

// ... 其他内容 ...

mermaid

graph LR
A[客户端请求] --> B[Middleware]
B --> C[Guard]
C --> D[Interceptor前]
D --> E[Pipe]
E --> F[Controller]
F --> G[Service]
G --> H[Interceptor后]
H --> I[Filter]
I --> J[客户端响应]
