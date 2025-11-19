/*
 * @Description: 微信公众号模板消息通知方法封装
 */
import axios from 'axios';

/**
 * 微信公众号通知参数接口
 */
export interface WechatMpRunData {
  appId: string;
  appSecret: string;
  openid: string;
  templateId: string;
  url?: string;
  data: Record<string, any>;
}

/**
 * 微信公众号通知返回结果接口
 */
export interface WechatMpRunResult {
  success: boolean;
  message?: string;
  data?: any;
}

/**
 * 格式化模板数据（公众号模板消息格式）
 * @param data 原始数据
 * @returns 格式化后的数据
 */
function formatTemplateData(data: Record<string, any>): Record<string, { value: string; color?: string }> {
  const formatted: Record<string, { value: string; color?: string }> = {};
  Object.keys(data).forEach((key) => {
    const item = data[key];
    if (typeof item === 'object' && item.value) {
      formatted[key] = {
        value: String(item.value),
        color: item.color || '#173177',
      };
    } else {
      formatted[key] = {
        value: String(item),
        color: '#173177',
      };
    }
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
 * 微信公众号模板消息通知方法
 * @param data 通知数据
 * @returns 执行结果
 */
export async function wechatMpRun(data: WechatMpRunData): Promise<WechatMpRunResult> {
  try {
    const { appId, appSecret, openid, templateId, url: redirectUrl, data: templateData } = data;
    const accessToken = await getWechatAccessToken(appId, appSecret);
    const url = `https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${accessToken}`;
    const requestData: any = {
      touser: openid,
      template_id: templateId,
      data: formatTemplateData(templateData),
    };
    if (redirectUrl) {
      requestData.url = redirectUrl;
    }
    const response = await axios.post(url, requestData);
    if (response.data.errcode !== 0) {
      return {
        success: false,
        message: `微信公众号模板消息发送失败: ${response.data.errmsg}`,
        data: response.data,
      };
    }
    return {
      success: true,
      message: '微信公众号模板消息发送成功',
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || '微信公众号模板消息发送异常',
      data: error.response?.data || null,
    };
  }
}

