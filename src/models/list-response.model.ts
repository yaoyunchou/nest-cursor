/**
 * 列表返回数据的标准结构
 * @template T 列表项类型
 */
export interface ListResponse<T> {
  /** 总条数 */
  total: number;
  /** 当前页码 */
  page: number;
  /** 每页条数 */
  pageSize: number;
  /** 列表数据 */
  list: T[];
  /** 其他数据 */
  [key: string]: any;
} 