/**
 * 清理数据库中无效的角色记录
 * 删除所有 code 字段为空字符串或 null 的角色记录
 * 
 * 使用方法：
 * 1. 确保已安装依赖：npm install 或 yarn install
 * 2. 运行脚本：npm run cleanup:roles
 * 
 * 注意：需要先设置环境变量或确保 .env.local 或 .env 文件存在
 */

import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 加载环境变量文件
 */
function loadEnvFile() {
  const envPaths = [
    path.resolve(__dirname, '../.env.local'),
    path.resolve(__dirname, '../.env'),
  ];
  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      const lines = envContent.split('\n');
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#')) {
          const [key, ...valueParts] = trimmedLine.split('=');
          if (key && valueParts.length > 0) {
            const value = valueParts.join('=').trim();
            // 移除引号
            const cleanValue = value.replace(/^["']|["']$/g, '');
            if (!process.env[key.trim()]) {
              process.env[key.trim()] = cleanValue;
            }
          }
        }
      }
      console.log(`已加载环境变量文件: ${envPath}`);
      break;
    }
  }
}

async function cleanupInvalidRoles() {
  // 加载环境变量
  loadEnvFile();
  const dataSource = new DataSource({
    type: (process.env.DB_TYPE || 'mysql') as any,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'test',
  });

  try {
    console.log('正在连接数据库...');
    console.log(`数据库配置: ${process.env.DB_TYPE}://${process.env.DB_USERNAME}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`);
    await dataSource.initialize();
    console.log('数据库连接成功');

    // 查询无效记录
    const invalidRoles = await dataSource.query(
      `SELECT id, code, name FROM role WHERE code = '' OR code IS NULL`
    );

    if (invalidRoles && invalidRoles.length > 0) {
      console.log(`找到 ${invalidRoles.length} 条无效记录：`);
      invalidRoles.forEach((role: any) => {
        console.log(`  - ID: ${role.id}, Code: "${role.code}", Name: ${role.name}`);
      });

      // 删除无效记录
      const result: any = await dataSource.query(
        `DELETE FROM role WHERE code = '' OR code IS NULL`
      );
      const affectedRows = result?.affectedRows ?? 0;
      console.log(`\n成功删除 ${affectedRows} 条无效记录`);
    } else {
      console.log('未找到无效记录');
    }

    await dataSource.destroy();
    console.log('数据库连接已关闭');
    process.exit(0);
  } catch (error) {
    console.error('清理失败:', error);
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
    process.exit(1);
  }
}

cleanupInvalidRoles();

