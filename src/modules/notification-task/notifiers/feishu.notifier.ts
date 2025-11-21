/*
 * @Description: 飞书通知方法封装
 */
import axios from 'axios';

/**
 * 飞书通知参数接口
 */
export interface FeishuNotificationData {
  appId?: string;
  appSecret?: string;
  userId: string;
  content: {
    title?: string;
    text?: string;
    [key: string]: any;
  };
}

/**
 * 飞书通知返回结果接口
 */
export interface FeishuNotificationResult {
  success: boolean;
  message?: string;
  data?: any;
}

/**
 * 获取飞书access_token
 * @param appId 应用ID
 * @param appSecret 应用密钥
 * @returns access_token
 */
export async function getFeishuAccessToken(appId: string, appSecret: string): Promise<string> {
  const url = 'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal';
  const response = await axios.post(url, {
    app_id: appId,
    app_secret: appSecret,
  });
  if (response.data?.code !== 0) {
    throw new Error(`获取飞书access_token失败: ${response.data.msg}`);
  }
  return response.data.tenant_access_token;
}

/**
 * 发送飞书通知
 * @param data 通知数据
 * @returns 执行结果
 */
export async function sendFeishuNotification(data: FeishuNotificationData): Promise<FeishuNotificationResult> {
  try {
    // 优先使用传入的参数，如果没有则从环境变量获取
    const appId = data.appId || process.env.FEISHU_APP_ID;
    const appSecret = data.appSecret || process.env.FEISHU_APP_SECRET;
    if (!appId || !appSecret) {
      throw new Error('飞书应用ID和密钥未配置');
    }
    const { userId, content } = data;
    const accessToken = await getFeishuAccessToken(appId, appSecret);
    const messageContent: any = {
      text: content.text || content.title || '',
    };
    if (content.title) {
      messageContent.text = `${content.title}\n${content.text || ''}`;
    }
    const receiveIdType = userId.startsWith('ou_') ? 'open_id' : 'user_id';
    const url = `https://open.feishu.cn/open-apis/im/v1/messages?receive_id_type=${receiveIdType}`;

    const response = await axios.post(
      url,
      {
        receive_id: userId,
        msg_type: 'text',
        content: JSON.stringify(messageContent),
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );
    if (response.data.code !== 0) {
      return {
        success: false,
        message: `飞书通知发送失败: ${response.data.msg}`,
        data: response.data,
      };
    }
    return {
      success: true,
      message: '飞书通知发送成功',
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || '飞书通知发送异常',
      data: error.response?.data || null,
    };
  }
}

