export function formatPrice(cents: number): string {
  return `¥${(cents / 100).toFixed(2)}`;
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function generateOrderNo(prefix: string): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const seq = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${date}-${seq}`;
}

export const ORDER_STATUS_MAP: Record<string, string> = {
  pending_confirmation: '待确认',
  in_production: '生产中',
  shipped: '已发货',
  completed: '已完成',
  cancelled: '已取消',
};

export const INQUIRY_STATUS_MAP: Record<string, string> = {
  pending_review: '待审核',
  quoted: '已报价',
  negotiating: '沟通中',
  accepted: '已接受',
  rejected: '已拒绝',
  closed: '已关闭',
};

export const MATERIAL_LIST = ['树脂', 'PLA', '尼龙', '金属', 'TPU', 'PETG', 'ABS', '光敏树脂'];
export const TECHNIQUE_LIST = ['SLA', 'FDM', 'SLS', 'MJF', 'DLP', 'SLM'];
export const COLOR_LIST = ['白色', '黑色', '灰色', '透明', '红色', '蓝色', '黄色', '绿色', '自定义'];
