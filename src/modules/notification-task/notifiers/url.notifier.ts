/*
 * @Description: URL通知方法封装
 */
import axios, { AxiosRequestConfig } from 'axios';

/**
 * URL通知参数接口
 */
export interface UrlRunData {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: Record<string, any>;
}

/**
 * URL通知返回结果接口
 */
export interface UrlRunResult {
  success: boolean;
  message?: string;
  data?: any;
}

/**
 * 替换URL和body中的模板变量
 * @param template 模板字符串
 * @param variables 变量对象
 * @returns 替换后的字符串
 */
function replaceTemplateVariables(template: string, variables: Record<string, any>): string {
  let result = template;
  Object.keys(variables).forEach((key) => {
    const regex = new RegExp(`\\{${key}\\}`, 'g');
    result = result.replace(regex, String(variables[key]));
  });
  return result;
}

/**
 * 递归替换对象中的模板变量
 * @param obj 对象
 * @param variables 变量对象
 * @returns 替换后的对象
 */
function replaceObjectVariables(obj: any, variables: Record<string, any>): any {
  if (typeof obj === 'string') {
    return replaceTemplateVariables(obj, variables);
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => replaceObjectVariables(item, variables));
  }
  if (obj && typeof obj === 'object') {
    const result: any = {};
    Object.keys(obj).forEach((key) => {
      result[key] = replaceObjectVariables(obj[key], variables);
    });
    return result;
  }
  return obj;
}

/**
 * URL通知方法
 * @param data 通知数据
 * @param variables 模板变量（可选，用于替换URL和body中的{变量名}）
 * @returns 执行结果
 */
export async function urlRun(data: UrlRunData, variables?: Record<string, any>): Promise<UrlRunResult> {
  try {
    let { url, method = 'POST', headers = {}, body } = data;
    if (variables) {
      url = replaceTemplateVariables(url, variables);
      if (body) {
        body = replaceObjectVariables(body, variables);
      }
      if (headers) {
        headers = replaceObjectVariables(headers, variables);
      }
    }
    const config: AxiosRequestConfig = {
      method,
      url,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };
    if (body && (method === 'POST' || method === 'PUT')) {
      config.data = body;
    }
    if (method === 'GET' && body) {
      config.params = body;
    }
    const response = await axios(config);
    return {
      success: true,
      message: 'URL通知发送成功',
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'URL通知发送异常',
      data: error.response?.data || null,
    };
  }
}

