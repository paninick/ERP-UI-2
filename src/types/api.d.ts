/** RuoYi 统一响应格式 */
export interface AjaxResult<T = any> {
  code: number;
  msg: string;
  data: T;
}

/** 分页列表响应 */
export interface TableDataInfo<T = any> {
  rows: T[];
  total: number;
  code: number;
  msg: string;
}

/** 分页查询参数 */
export interface PageQuery {
  pageNum: number;
  pageSize: number;
  [key: string]: any;
}

/** 基础实体 */
export interface BaseEntity {
  id?: number;
  createBy?: string;
  createTime?: string;
  updateBy?: string;
  updateTime?: string;
  remark?: string;
}
