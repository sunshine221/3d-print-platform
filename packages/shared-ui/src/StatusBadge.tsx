import React from 'react';
import { ORDER_STATUS_MAP, INQUIRY_STATUS_MAP } from '@3d-print/utils';

type StatusBadgeProps = {
  status: string;
  type: 'order' | 'inquiry';
};

const STATUS_COLORS: Record<string, string> = {
  // 订单
  pending_confirmation: '#faad14',
  in_production: '#1890ff',
  shipped: '#722ed1',
  completed: '#52c41a',
  cancelled: '#d9d9d9',
  // 询价
  pending_review: '#faad14',
  quoted: '#1890ff',
  negotiating: '#722ed1',
  accepted: '#52c41a',
  rejected: '#ff4d4f',
  closed: '#d9d9d9',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type }) => {
  const label =
    type === 'order' ? ORDER_STATUS_MAP[status] : INQUIRY_STATUS_MAP[status];
  const color = STATUS_COLORS[status] || '#d9d9d9';

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: 4,
        fontSize: 12,
        color: '#fff',
        backgroundColor: color,
      }}
    >
      {label || status}
    </span>
  );
};
