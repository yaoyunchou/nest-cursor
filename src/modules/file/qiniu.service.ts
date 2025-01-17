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
  private mac: qiniu.auth.digest.Mac;
  private bucket: string;
  private domain: string;

  constructor(private configService: ConfigService) {
    this.mac = new qiniu.auth.digest.Mac(
      this.configService.get('QINIU_ACCESS_KEY'),
      this.configService.get('QINIU_SECRET_KEY'),
    );
    this.bucket = this.configService.get('QINIU_BUCKET');
    this.domain = this.configService.get('QINIU_DOMAIN');
  }

  getUploadToken(): string {
    const putPolicy = new qiniu.rs.PutPolicy({
      scope: this.bucket,
    });
    return putPolicy.uploadToken(this.mac);
  }

  async deleteFile(key: string): Promise<void> {
    const config = new qiniu.conf.Config();
    const bucketManager = new qiniu.rs.BucketManager(this.mac, config);
    
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

  getFileUrl(key: string): string {
    return `${this.domain}/${key}`;
  }
} 