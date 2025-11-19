/*
 * @Description: 飞书通知方法封装
 */
import axios from 'axios';

/**
 * 飞书通知参数接口
 */
export interface FeishuRunData {
  appId: string;
  appSecret: string;
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
export interface FeishuRunResult {
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
async function getFeishuAccessToken(appId: string, appSecret: string): Promise<string> {
  const url = 'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal';
  const response = await axios.post(url, {
    app_id: appId,
    app_secret: appSecret,
  });
  if (response.data.code !== 0) {
    throw new Error(`获取飞书access_token失败: ${response.data.msg}`);
  }
  return response.data.tenant_access_token;
}

/**
 * 飞书通知方法
 * @param data 通知数据
 * @returns 执行结果
 */
export async function feishuRun(data: FeishuRunData): Promise<FeishuRunResult> {
  try {
    const { appId, appSecret, userId, content } = data;
    const accessToken = await getFeishuAccessToken(appId, appSecret);
    const url = 'https://open.feishu.cn/open-apis/im/v1/messages';
    const messageContent: any = {
      text: content.text || content.title || '',
    };
    if (content.title) {
      messageContent.text = `${content.title}\n${content.text || ''}`;
    }
    const response = await axios.post(
      url,
      {
        receive_id: userId,
        receive_id_type: 'open_id',
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

