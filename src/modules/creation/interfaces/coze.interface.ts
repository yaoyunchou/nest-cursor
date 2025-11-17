/*
 * @Author: yaoyc yaoyunchou@bananain.com
 * @Date: 2025-01-18 10:00:44
 * @LastEditors: yaoyc yaoyunchou@bananain.com
 * @LastEditTime: 2025-01-18 10:00:44
 * @FilePath: \nest-cursor\src\modules\creation\interfaces\coze.interface.ts
 * @Description: Coze API接口定义
 */

/**
 * Coze授权请求参数
 */
export interface CozeAuthRequest {
  duration_seconds: number;
  grant_type: string;
}

/**
 * Coze授权响应
 */
export interface CozeAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

/**
 * Coze文件上传响应
 */
export interface CozeFileUploadResponse {
  id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  created_at: number;
  updated_at: number;
}

/**
 * Coze工作流运行请求参数
 */
export interface CozeWorkflowRunRequest {
  workflow_id: string;
  parameters: Record<string, any>;
  is_async?: boolean;
}

/**
 * Coze工作流运行响应
 */
export interface CozeWorkflowRunResponse {
  execute_id: string;
  data: any;
  cost_tokens: number;
  token: string;
  debug_url?: string;
}

/**
 * Coze工作流状态查询响应
 */
export interface CozeWorkflowStatusResponse {
  execute_id: string;
  status: 'running' | 'success' | 'failed';
  data?: any;
  error_message?: string;
  cost_tokens?: number;
  created_at: number;
  updated_at: number;
}

/**
 * Coze API错误响应
 */
export interface CozeErrorResponse {
  error: {
    code: string;
    message: string;
    type: string;
  };
}

/**
 * Coze服务配置
 */
export interface CozeConfig {
  baseUrl?: string;
  apiKey?: string;
  defaultWorkflowId?: string;
  timeout?: number;
  client_type: string;
  client_id: string;
  coze_www_base: string;
  coze_api_base: string;
  private_key: string;
  public_key_id: string;
} 