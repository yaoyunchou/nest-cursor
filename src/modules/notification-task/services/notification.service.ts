/*
 * @Description: 通知服务 - 统一调用入口
 */
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { NotificationTask, NotificationChannel } from '../entities/notification-task.entity';
import { feishuRun, FeishuRunData } from '../notifiers/feishu.notifier';
import { wechatMiniRun, WechatMiniRunData } from '../notifiers/wechat-mini.notifier';
import { wechatMpRun, WechatMpRunData } from '../notifiers/wechat-mp.notifier';
import { urlRun, UrlRunData } from '../notifiers/url.notifier';
import { DictionaryService } from '../../dictionary/dictionary.service';
import { UserService } from '../../user/user.service';

/**
 * 通知服务
 */
@Injectable()
export class NotificationService {
  constructor(
    private readonly dictionaryService: DictionaryService,
    private readonly userService: UserService,
  ) {}

  /**
   * 获取微信账号配置
   * @param accountId 账号ID
   * @returns 微信账号配置
   */
  private async getWechatAccountConfig(accountId: string) {
    const dictionary = await this.dictionaryService.findByCategoryAndName('wechat', 'wechat_mini_program_account');
    if (!dictionary) {
      throw new HttpException('未配置微信账号', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    const accounts = JSON.parse(dictionary.value) as Array<{ id: string; appId: string; appSecret: string; name: string }>;
    if (!accounts || accounts.length === 0) {
      throw new HttpException('微信账号配置为空', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    const account = accounts.find((acc) => acc.id === accountId);
    if (!account) {
      throw new HttpException(`未找到ID为 ${accountId} 的微信账号`, HttpStatus.BAD_REQUEST);
    }
    return {
      appId: account.appId,
      appSecret: account.appSecret,
      name: account.name,
      id: account.id,
    };
  }

  /**
   * 发送通知
   * @param task 通知任务
   * @returns 执行结果
   */
  async send(task: NotificationTask): Promise<{ success: boolean; message?: string; data?: any }> {
    const { channel, channelConfig, content, userId } = task;
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new HttpException(`用户不存在: ${userId}`, HttpStatus.NOT_FOUND);
    }
    switch (channel) {
      case NotificationChannel.FEISHU:
        return this.sendFeishuNotification(task, user);
      case NotificationChannel.WECHAT_MINI:
        return this.sendWechatMiniNotification(task, user);
      case NotificationChannel.WECHAT_MP:
        return this.sendWechatMpNotification(task, user);
      case NotificationChannel.URL:
        return this.sendUrlNotification(task, user);
      default:
        throw new HttpException(`不支持的通知渠道: ${channel}`, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * 发送飞书通知
   */
  private async sendFeishuNotification(task: NotificationTask, user: any) {
    const { channelConfig, content } = task;
    const data: FeishuRunData = {
      appId: channelConfig.appId,
      appSecret: channelConfig.appSecret,
      userId: channelConfig.userId,
      content: content,
    };
    return await feishuRun(data);
  }

  /**
   * 发送微信小程序通知
   */
  private async sendWechatMiniNotification(task: NotificationTask, user: any) {
    const { channelConfig, content } = task;
    const wechatConfig = await this.getWechatAccountConfig(channelConfig.accountId);
    if (!user.openid) {
      throw new HttpException(`用户未绑定微信openid: ${user.id}`, HttpStatus.BAD_REQUEST);
    }
    const data: WechatMiniRunData = {
      appId: wechatConfig.appId,
      appSecret: wechatConfig.appSecret,
      openid: user.openid,
      templateId: channelConfig.templateId,
      page: channelConfig.page,
      data: channelConfig.data || content,
    };
    return await wechatMiniRun(data);
  }

  /**
   * 发送微信公众号通知
   */
  private async sendWechatMpNotification(task: NotificationTask, user: any) {
    const { channelConfig, content } = task;
    const wechatConfig = await this.getWechatAccountConfig(channelConfig.accountId);
    if (!user.openid) {
      throw new HttpException(`用户未绑定微信openid: ${user.id}`, HttpStatus.BAD_REQUEST);
    }
    const data: WechatMpRunData = {
      appId: wechatConfig.appId,
      appSecret: wechatConfig.appSecret,
      openid: user.openid,
      templateId: channelConfig.templateId,
      url: channelConfig.url,
      data: channelConfig.data || content,
    };
    return await wechatMpRun(data);
  }

  /**
   * 发送URL通知
   */
  private async sendUrlNotification(task: NotificationTask, user: any) {
    const { channelConfig } = task;
    const variables = {
      userId: user.id,
      userName: user.username,
      userPhone: user.phone || '',
      userEmail: user.email || '',
      ...task.content,
    };
    const data: UrlRunData = {
      url: channelConfig.url,
      method: channelConfig.method || 'POST',
      headers: channelConfig.headers,
      body: channelConfig.body,
    };
    return await urlRun(data, variables);
  }
}

