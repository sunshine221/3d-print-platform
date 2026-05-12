let mockPrisma: any;

jest.mock('@prisma/client', () => {
  mockPrisma = {
    pageView: { count: jest.fn() },
    order: { count: jest.fn(), findMany: jest.fn() },
    printServiceInquiry: { count: jest.fn(), findMany: jest.fn() },
    product: { count: jest.fn() },
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [DashboardService],
    }).compile();
    service = module.get<DashboardService>(DashboardService);
  });

  describe('getStats', () => {
    it('应返回统计数据', async () => {
      mockPrisma.pageView.count.mockResolvedValue(50);
      mockPrisma.order.count.mockResolvedValueOnce(10).mockResolvedValueOnce(6);
      mockPrisma.printServiceInquiry.count.mockResolvedValue(5);
      mockPrisma.product.count.mockResolvedValue(20);

      const stats = await service.getStats();
      expect(stats.todayPageViews).toBe(50);
      expect(stats.monthOrders).toBe(10);
      expect(stats.monthInquiries).toBe(5);
      expect(stats.activeProducts).toBe(20);
      expect(stats.conversionRate).toBe(60); // 6/10 * 100
    });
  });

  describe('getRecentOrders', () => {
    it('应返回最新 10 条订单', async () => {
      mockPrisma.order.findMany.mockResolvedValue([{ id: '1', orderNo: 'ORD001' }]);
      const result = await service.getRecentOrders();
      expect(result).toHaveLength(1);
    });
  });

  describe('getRecentInquiries', () => {
    it('应返回最新 10 条询价', async () => {
      mockPrisma.printServiceInquiry.findMany.mockResolvedValue([{ id: '1', inquiryNo: 'INQ001' }]);
      const result = await service.getRecentInquiries();
      expect(result).toHaveLength(1);
    });
  });
});
