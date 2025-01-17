/*
 * @Author: yaoyc yaoyunchou@bananain.com
 * @Date: 2025-01-14 14:35:14
 * @LastEditors: yaoyc yaoyunchou@bananain.com
 * @LastEditTime: 2025-01-14 19:55:56
 * @FilePath: \nest-cursor\src\app.module.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { BookModule } from './modules/book/book.module';
import { ArticleModule } from './modules/article/article.module';
import { HealthController } from './health/health.controller';
import { RoleModule } from './modules/role/role.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env'],
      isGlobal: true,
      expandVariables: true,
      cache: true,
    }),
    TypeOrmModule.forRoot({
      type: process.env.DB_TYPE as any,
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      logging: process.env.LOG_ON === 'true',
      synchronize: true,
      logger: process.env.LOG_LEVEL as any,
    }),
    AuthModule,
    UserModule,
    BookModule,
    ArticleModule,
    RoleModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
