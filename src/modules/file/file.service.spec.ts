/*
 * @Description: 文件服务集成测试（使用真实代码和真实数据）
 * 注意：这个测试会真正调用七牛云 API 和数据库，需要有效的配置
 * 运行方式：npm test -- file.service.spec.ts
 */
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FileService } from './file.service';
import { File } from './entities/file.entity';
import { QiniuService } from './qiniu.service';

describe('FileService - mergeAudioByUrls (集成测试)', () => {
  const isIntegrationTest = true;
  if (!isIntegrationTest) {
    console.log('跳过mc集成测试：设置 isIntegrationTest=true 来运行');
    return;
  }
  let service: FileService;
  let module: TestingModule;

  beforeAll(async () => {
    // 检查必要的环境变量
    const requiredEnvVars = [
      'QINIU_ACCESS_KEY',
      'QINIU_SECRET_KEY',
      'QINIU_BUCKET',
      'QINIU_DOMAIN',
      'DB_TYPE',
      'DB_HOST',
      'DB_PORT',
      'DB_USERNAME',
      'DB_PASSWORD',
      'DB_DATABASE',
    ];

    const missingVars = requiredEnvVars.filter((key) => !process.env[key]);
    if (missingVars.length > 0) {
      console.warn(`警告：缺少环境变量: ${missingVars.join(', ')}`);
      console.warn('测试可能会失败，请确保 .env 文件已正确配置');
    }

    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: ['.env.local', '.env'],
          isGlobal: true,
          expandVariables: true,
        }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (configService: ConfigService) => ({
            type: configService.get<string>('DB_TYPE') as any,
            host: configService.get<string>('DB_HOST'),
            port: parseInt(configService.get<string>('DB_PORT') || '3306', 10),
            username: configService.get<string>('DB_USERNAME'),
            password: configService.get<string>('DB_PASSWORD'),
            database: configService.get<string>('DB_DATABASE'),
            entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
            synchronize: false, // 集成测试不自动同步数据库结构
            logging: false, // 关闭 SQL 日志，避免测试输出过多
          }),
          inject: [ConfigService],
        }),
        TypeOrmModule.forFeature([File]),
      ],
      providers: [FileService, QiniuService],
    }).compile();

    service = module.get<FileService>(FileService);
  });

  afterAll(async () => {
    if (module) {
      await module.close();
    }
  });

  describe('mergeAudioByUrls - 真实数据测试', () => {
    it('应该成功合并两个音频文件', async () => {
      // 安排
      const inputUrls = [
        'https://cdn.xfysj.top/coze/1764505984982-s7zj5wf3kviwi51u1e4ywj.mpeg',
        'https://cdn.xfysj.top/coze/1764505985529-wxc9ncsvp5tl36ecsb1c.mpeg',
      ];
      const userId = 1;

      console.log('开始测试音频合并...');
      console.log('输入URLs:', inputUrls);
      console.log('用户ID:', userId);

      // 行动
      const result = await service.mergeAudioByUrls(inputUrls, userId);

      // 断言
      console.log('合并结果:', result);
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.url).toBeDefined();
      expect(result.key).toBeDefined();
      expect(result.userId).toBe(userId);
      expect(result.mimetype).toBe('audio/mpeg');
      expect(result.url).toContain('coze/merged/');
    }, 120000); // 设置超时时间为 120 秒，因为音频合并可能需要较长时间
  });

  it('应该被定义', () => {
    expect(service).toBeDefined();
  });
});

