/*
 * @Author: yaoyc yaoyunchou@bananain.com
 * @Date: 2025-01-16 15:50:44
 * @LastEditors: yaoyc yaoyunchou@bananain.com
 * @LastEditTime: 2025-01-16 15:50:44
 * @FilePath: \nest-cursor\src\shared\interfaces\pagination.interface.ts
 * @Description: 分页接口
 */

export class PaginatedResponse<T> {
  /**
   * 数据列表
   */
  list: T[];

  /**
   * 总数
   */
  total: number;

  /**
   * 每页数量
   */
  pageSize: number;

  /**
   * 当前页码
   */
  pageIndex: number;
} 