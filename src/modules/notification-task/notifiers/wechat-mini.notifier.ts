/*
 * @Description: 微信小程序订阅消息通知方法封装
 */
import axios from 'axios';

/**
 * 微信小程序通知参数接口
 */
export interface WechatMiniNotificationData {
  appId: string;
  appSecret: string;
  openid: string;
  templateId: string;
  page?: string;
  data: Record<string, any>;
}

/**
 * 微信小程序通知返回结果接口
 */
export interface WechatMiniNotificationResult {
  success: boolean;
  message?: string;
  data?: any;
}

/**
 * 格式化模板数据（小程序订阅消息格式）
 * @param data 原始数据
 * @returns 格式化后的数据
 */
function formatTemplateData(data: Record<string, any>): Record<string, { value: string }> {
  const formatted: Record<string, { value: string }> = {};
  Object.keys(data).forEach((key) => {
    formatted[key] = {
      value: String(data[key]),
    };
  });
  return formatted;
}

/**
 * 获取微信access_token
 * @param appId 应用ID
 * @param appSecret 应用密钥
 * @returns access_token
 */
async function getWechatAccessToken(appId: string, appSecret: string): Promise<string> {
  const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`;
  const response = await axios.get(url);
  if (response.data.errcode) {
    throw new Error(`获取微信access_token失败: ${response.data.errmsg}`);
  }
  return response.data.access_token;
}

/**
 * 发送微信小程序订阅消息通知
 * @param data 通知数据
 * @returns 执行结果
 */
export async function sendWechatMiniNotification(data: WechatMiniNotificationData): Promise<WechatMiniNotificationResult> {
  try {
    const { appId, appSecret, openid, templateId, page, data: templateData } = data;
    const accessToken = await getWechatAccessToken(appId, appSecret);
    const url = `https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${accessToken}`;
    const requestData: any = {
      touser: openid,
      template_id: templateId,
      data: formatTemplateData(templateData),
    };
    if (page) {
      requestData.page = page;
    }
    const response = await axios.post(url, requestData);
    if (response.data.errcode !== 0) {
      return {
        success: false,
        message: `微信小程序订阅消息发送失败: ${response.data.errmsg}`,
        data: response.data,
      };
    }
    return {
      success: true,
      message: '微信小程序订阅消息发送成功',
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || '微信小程序订阅消息发送异常',
      data: error.response?.data || null,
    };
  }
}

