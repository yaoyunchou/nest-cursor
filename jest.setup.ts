/*
 * @Description: Jest 测试环境设置文件，用于加载环境变量
 */
import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * 加载 .env 文件到 process.env
 */
function loadEnvFile(filePath: string): void {
  try {
    const envFile = readFileSync(filePath, 'utf-8');
    const lines = envFile.split('\n');
    for (const line of lines) {
      const trimmedLine = line.trim();
      // 跳过空行和注释
      if (!trimmedLine || trimmedLine.startsWith('#')) {
        continue;
      }
      // 解析 KEY=VALUE 格式
      const equalIndex = trimmedLine.indexOf('=');
      if (equalIndex > 0) {
        const key = trimmedLine.substring(0, equalIndex).trim();
        let value = trimmedLine.substring(equalIndex + 1).trim();
        // 移除引号
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        // 只在环境变量不存在时设置（避免覆盖已存在的环境变量）
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  } catch (error) {
    // 文件不存在时忽略错误
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      console.warn(`警告: 无法加载环境变量文件 ${filePath}:`, error);
    }
  }
}

// 按优先级加载环境变量文件（.env.local 优先于 .env）
// 从项目根目录加载（jest.setup.ts 位于项目根目录）
const rootDir = process.cwd();
loadEnvFile(resolve(rootDir, '.env.local'));
loadEnvFile(resolve(rootDir, '.env'));

