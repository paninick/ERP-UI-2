import client from './client';

export interface DashboardStats {
  stats: {
    salesCount: number;
    customerCount: number;
    jobCount: number;
    inventoryCount: number;
  };
  recentSales: any[];
  recentJobs: any[];
  salesStatusBreakdown: { status: string; count: number }[];
  jobStatusBreakdown: { status: string; count: number }[];
}

export function getDashboardStats(): Promise<DashboardStats> {
  return client.get('/erp/dashboard/stats');
}
