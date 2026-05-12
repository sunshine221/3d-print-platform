let mockPrisma: any;

jest.mock('@prisma/client', () => {
  mockPrisma = {
    order: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    orderItem: {
      create: jest.fn(),
    },
    orderLog: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    product: {
      findUnique: jest.fn(),
    },
    sku: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn((fn: any) => fn(mockPrisma)),
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { NotFoundException } from '@nestjs/common';

function mockOrder(overrides: Record<string, unknown> = {}) {
  return {
    id: '1',
    orderNo: 'ORD001',
    totalPrice: '99.00',
    discountAmount: '0',
    couponCode: null,
    note: null,
    status: 'pending_confirmation',
    contactName: '张三',
    contactPhone: '13800138000',
    shippingAddress: null,
    trackingNumber: null,
    trackingCompany: null,
    sourceInquiryId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: { email: 'a@b.com', name: '张三' },
    items: [],
    logs: [],
    ...overrides,
  };
}

describe('OrderService', () => {
  let service: OrderService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderService],
    }).compile();
    service = module.get<OrderService>(OrderService);
  });

  describe('findAll', () => {
    it('应返回分页订单列表', async () => {
      mockPrisma.order.findMany.mockResolvedValue([mockOrder()]);
      mockPrisma.order.count.mockResolvedValue(1);
      const result = await service.findAll({ page: 1, pageSize: 20 });
      expect(result.items).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });
  });

  describe('findById', () => {
    it('应返回订单详情', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(mockOrder());
      const result = await service.findById('1');
      expect(result.orderNo).toBe('ORD001');
    });

    it('应订单不存在时抛出 NotFoundException', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(null);
      await expect(service.findById('bad')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('应更新订单状态', async () => {
      mockPrisma.order.findUnique
        .mockResolvedValueOnce(mockOrder({ status: 'pending_confirmation' }))
        .mockResolvedValueOnce(mockOrder({ status: 'in_production' }));
      mockPrisma.order.update.mockResolvedValue({});
      const result = await service.updateStatus('1', { status: 'in_production' }, { type: 'admin', id: 'admin1' });
      expect(result.status).toBe('in_production');
    });
  });
});
