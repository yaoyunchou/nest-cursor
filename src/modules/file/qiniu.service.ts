/*
 * @Author: yaoyc yaoyunchou@bananain.com
 * @Date: 2025-01-18 10:00:44
 * @LastEditors: yaoyc yaoyunchou@bananain.com
 * @LastEditTime: 2025-01-18 10:00:44
 * @FilePath: \nest-cursor\src\modules\file\qiniu.service.ts
 * @Description: 七牛云服务
 */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as qiniu from 'qiniu';

@Injectable()
export class QiniuService {
  private mac: qiniu.auth.digest.Mac; // 七牛云认证实例
  private bucket: string; // 存储空间名称
  private domain: string; // 访问域名

  constructor(private configService: ConfigService) {
    // 初始化七牛云认证信息
    this.mac = new qiniu.auth.digest.Mac(
      this.configService.get('QINIU_ACCESS_KEY'),
      this.configService.get('QINIU_SECRET_KEY'),
    );
    this.bucket = this.configService.get('QINIU_BUCKET');
    this.domain = this.configService.get('QINIU_DOMAIN');
  }

  /**
   * 获取上传凭证
   * @returns 上传凭证字符串
   */
  getUploadToken(): string {
    const putPolicy = new qiniu.rs.PutPolicy({
      scope: this.bucket,
    });
    return putPolicy.uploadToken(this.mac);
  }

  /**
   * 上传文件到七牛云
   * @param file 文件Buffer
   * @param key 文件名
   * @returns 上传结果
   */
  async uploadFile(file: Buffer, key: string): Promise<{ url: string }> {
    const config = new qiniu.conf.Config(); // 创建七牛云配置
    const formUploader = new qiniu.form_up.FormUploader(config); // 创建上传器实例
    const putExtra = new qiniu.form_up.PutExtra(); // 创建上传额外参数

    return new Promise((resolve, reject) => {
      formUploader.put(
        this.getUploadToken(),
        key,
        file,
        putExtra,
        (err, body, info) => {
          if (err) {
            reject(err);
          }
          if (info.statusCode === 200) {
            resolve({ url: this.getFileUrl(key) });
          } else {
            reject(new Error('上传失败'));
          }
        },
      );
    });
  }

  /**
   * 删除七牛云上的文件
   * @param key 文件名
   */
  async deleteFile(key: string): Promise<void> {
    const config = new qiniu.conf.Config(); // 创建七牛云配置
    const bucketManager = new qiniu.rs.BucketManager(this.mac, config); // 创建存储空间管理器
    
    return new Promise((resolve, reject) => {
      bucketManager.delete(this.bucket, key, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * 获取文件访问链接
   * @param key 文件名
   * @returns 完整的文件访问URL
   */
  getFileUrl(key: string): string {
    return `${this.domain}/${key}`;
  }

  /**
   * 从七牛云URL中提取文件key
   * @param url 七牛云文件URL
   * @returns 文件key，如果不是七牛云URL则返回null
   */
  extractKeyFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      // 获取配置的域名（可能是完整URL或只是域名）
      let domainHostname: string;
      try {
        const domainUrl = new URL(this.domain);
        domainHostname = domainUrl.hostname;
      } catch {
        // 如果domain不是完整URL，直接使用
        domainHostname = this.domain.replace(/^https?:\/\//, '').split('/')[0];
      }
      // 检查是否是当前配置的域名
      if (urlObj.hostname === domainHostname) {
        // 提取路径部分（去掉开头的/）
        const key = urlObj.pathname.substring(1);
        // 移除查询参数和hash
        const cleanKey = key.split('?')[0].split('#')[0];
        return cleanKey || null;
      }
      // 如果不是当前域名，尝试从路径中提取（兼容其他七牛云域名格式）
      const pathMatch = urlObj.pathname.match(/^\/(.+)$/);
      if (pathMatch && pathMatch[1]) {
        // 移除查询参数和hash
        const cleanKey = pathMatch[1].split('?')[0].split('#')[0];
        return cleanKey || null;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * 合并多个音频文件
   * @param sourceKeys 源文件key数组（最多21个）
   * @param outputKey 输出文件key
   * @param format 输出格式，默认为mp3
   * @returns 持久化处理ID
   */
  async concatAudio(
    sourceKeys: string[],
    outputKey: string,
    format: string = 'mp3',
  ): Promise<string> {
    if (sourceKeys.length < 2 || sourceKeys.length > 21) {
      throw new Error('音频文件数量必须在2-21个之间');
    }
    const config = new qiniu.conf.Config();
    const operManager = new qiniu.fop.OperationManager(this.mac, config);
    // 根据七牛云官方文档，avconcat指令格式：
    // avconcat/2/format/mp3/kodo://bucket/key1的base64/kodo://bucket/key2的base64|saveas/输出key的base64
    // 对于kodo资源，使用 kodo://bucket/key 格式，然后进行 urlsafe_base64_encode
    const encodedUrls = sourceKeys.map(key => {
      const kodoUrl = `kodo://${this.bucket}/${key}`;
      return qiniu.util.urlsafeBase64Encode(kodoUrl);
    });
    // 使用 / 分隔符连接编码后的URL
    const keysParam = encodedUrls.join('/');
    // 构建saveas参数：base64编码的bucket:key
    const saveas = qiniu.util.urlsafeBase64Encode(`${this.bucket}:${outputKey}`);
    // 完整的fops指令，使用 | 分隔 saveas 参数
    const fops = `avconcat/2/format/${format}/${keysParam}|saveas/${saveas}`;
    const pipeline = ''; // 使用默认队列
    const options: qiniu.fop.PfopOptions = {}; // 不设置回调URL和其他选项
    return new Promise((resolve, reject) => {
      operManager.pfop(
        this.bucket,
        sourceKeys[0], // 第一个源文件作为主文件
        [fops],
        pipeline,
        options,
        (err, respBody, respInfo) => {
          if (err) {
            reject(err);
            return;
          }
          if (respInfo.statusCode === 200) {
            resolve(respBody.persistentId);
          } else {
            reject(new Error(`合并失败: ${JSON.stringify(respBody)}`));
          }
        },
      );
    });
  }

  /**
   * 查询持久化处理状态
   * @param persistentId 持久化处理ID
   * @returns 处理状态信息
   */
  async getPersistentStatus(persistentId: string): Promise<any> {
    const config = new qiniu.conf.Config();
    const operManager = new qiniu.fop.OperationManager(this.mac, config);
    return new Promise((resolve, reject) => {
      operManager.prefop(persistentId, (err, respBody, respInfo) => {
        if (err) {
          reject(err);
          return;
        }
        if (respInfo.statusCode === 200) {
          resolve(respBody);
        } else {
          reject(new Error(`查询状态失败: ${JSON.stringify(respBody)}`));
        }
      });
    });
  }

  /**
   * 检查文件是否存在
   * @param key 文件key
   * @returns 文件是否存在
   */
  async checkFileExists(key: string): Promise<boolean> {
    const config = new qiniu.conf.Config();
    const bucketManager = new qiniu.rs.BucketManager(this.mac, config);
    return new Promise((resolve) => {
      bucketManager.stat(this.bucket, key, (err, respBody, respInfo) => {
        if (err || respInfo.statusCode !== 200) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }
} 