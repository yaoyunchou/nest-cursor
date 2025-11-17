/*
 * @Author: yaoyc yaoyunchou@bananain.com
 * @Date: 2025-01-14 14:35:14
 * @LastEditors: yaoyc yaoyunchou@bananain.com
 * @LastEditTime: 2025-01-14 16:27:21
 * @FilePath: \nest-cursor\src\main.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import { LoggerMiddleware } from './core/middleware/logger.middleware';
import { TransformInterceptor } from './core/interceptors/transform.interceptor';
import { JwtExceptionFilter } from './core/filters/jwt-exception.filter';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  
  app.setGlobalPrefix('api/v1');
  
  app.useGlobalInterceptors(new TransformInterceptor());

  // 配置JWT异常过滤器
  app.useGlobalFilters(new JwtExceptionFilter());
  app.use(LoggerMiddleware);
  
  // 配置 Swagger
  const config = new DocumentBuilder()
    .setTitle('CMS API 文档')
    .setDescription('图书、文章和用户管理系统的 API 文档')
    .setVersion('3.0.0')
    // .addServer('http://localhost:3000', '开发环境')
    .setExternalDoc('接口规范文档', 'https://api.example.com/spec')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config,{
    // openapi: '3.0.3', // 明确指定 OpenAPI 版本
  });
  SwaggerModule.setup('api', app, document, {
    customSiteTitle: 'CMS API 文档',
    // customCss: '.swagger-ui .topbar { display: none }',
    explorer: true,
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showCommonExtensions: true,
      showExtensions: true,
    },
  });

  const port = process.env.APP_PORT || 3000;
  await app.listen(port);
  logger.log(`应用程序已启动: http://localhost:${port}`);
  logger.log(`API 文档地址: http://localhost:${port}/api`);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
