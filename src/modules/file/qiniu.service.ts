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
} 