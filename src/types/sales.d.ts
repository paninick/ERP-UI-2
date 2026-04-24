import {BaseEntity} from './api';

export interface SalesOrder extends BaseEntity {
  id?: number;
  salesNo?: string;
  customerName?: string;
  customerNo?: string;
  styleCode?: string;
  bulkOrderNo?: string;
  orderStatus?: string;
  orderDate?: string;
  deliveryDate?: string;
  amount?: number;
  currency?: string;
  quantity?: number;
  remark?: string;
}

export interface SalesOrderItem extends BaseEntity {
  id?: number;
  salesId?: number;
  colorCode?: string;
  colorName?: string;
  sizeCode?: string;
  quantity?: number;
  price?: number;
  amount?: number;
}
