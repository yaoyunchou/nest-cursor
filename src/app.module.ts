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
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { BookModule } from './modules/book/book.module';
import { ArticleModule } from './modules/article/article.module';
import { HealthController } from './health/health.controller';
import { RoleModule } from './modules/role/role.module';
import { FileModule } from './modules/file/file.module';
import { TargetModule } from './modules/target/target.module';
import { CreationModule } from './modules/creation/creation.module';
import { CoreModule } from './core/core.module';
import { LowcodeModule } from './modules/lowcode/lowcode.module';
import { NavigationModule } from './modules/navigation/navigation.module';
import { UserActionModule } from './modules/userAction/user-action.module';
import { DictionaryModule } from './modules/dictionary/dictionary.module';
import { AiModule } from './modules/ai/ai.module';
import { Esp32Module } from './modules/esp32/esp32.module';
import { NotificationTaskModule } from './modules/notification-task/notification-task.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env'],
      isGlobal: true,
      expandVariables: true,
      cache: true,
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: configService.get<string>('DB_TYPE') as any,
        host: configService.get<string>('DB_HOST'),
        port: parseInt(configService.get<string>('DB_PORT') || '3306', 10),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        logging: configService.get<string>('LOG_ON') === 'true',
        synchronize: true,
        logger: configService.get<string>('LOG_LEVEL') as any,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
    BookModule,
    ArticleModule,
    RoleModule,
    FileModule,
    Esp32Module,
    TargetModule,
    CreationModule,
    CoreModule,
    LowcodeModule,
    NavigationModule,
    UserActionModule,
    DictionaryModule,
    AiModule,
    NotificationTaskModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
