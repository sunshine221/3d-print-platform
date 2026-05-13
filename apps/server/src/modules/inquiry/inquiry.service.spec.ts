let mockPrisma: any;

jest.mock('@prisma/client', () => {
  mockPrisma = {
    printServiceInquiry: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    inquiryMessage: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    inquiryLog: {
      create: jest.fn(),
    },
    product: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn((fn: any) => fn(mockPrisma)),
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

import { Test, TestingModule } from '@nestjs/testing';
import { InquiryService } from './inquiry.service';
import { NotFoundException } from '@nestjs/common';

function mockInquiry(overrides: Record<string, unknown> = {}) {
  return {
    id: '1',
    inquiryNo: 'INQ001',
    productId: 'p1',
    product: { id: 'p1', name: '测试产品' },
    desiredMaterial: 'PLA',
    desiredColor: '白色',
    desiredQuantity: 10,
    desiredSize: null,
    desiredDeadline: null,
    additionalNotes: null,
    contactName: '张三',
    contactPhone: '13800138000',
    status: 'pending_review',
    adminQuoteUnitPrice: null,
    adminQuoteQuantity: null,
    adminQuoteTotalPrice: null,
    adminQuoteNote: null,
    adminQuoteDeliveryDays: null,
    adminQuoteAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: { phone: '13800001111', name: '张三' },
    files: [],
    messages: [],
    logs: [],
    ...overrides,
  };
}

describe('InquiryService', () => {
  let service: InquiryService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [InquiryService],
    }).compile();
    service = module.get<InquiryService>(InquiryService);
  });

  describe('findAll', () => {
    it('应返回分页询价列表', async () => {
      mockPrisma.printServiceInquiry.findMany.mockResolvedValue([mockInquiry()]);
      mockPrisma.printServiceInquiry.count.mockResolvedValue(1);
      const result = await service.findAll({ page: 1, pageSize: 20 });
      expect(result.items).toHaveLength(1);
    });
  });

  describe('findById', () => {
    it('应询价不存在时抛出 NotFoundException', async () => {
      mockPrisma.printServiceInquiry.findUnique.mockResolvedValue(null);
      await expect(service.findById('bad')).rejects.toThrow(NotFoundException);
    });
  });

  describe('quote', () => {
    it('应填写报价并变更状态为 quoted', async () => {
      mockPrisma.printServiceInquiry.findUnique
        .mockResolvedValueOnce(mockInquiry({ status: 'pending_review' }))
        .mockResolvedValueOnce(mockInquiry({ status: 'quoted', adminQuoteTotalPrice: '100', adminQuoteUnitPrice: '10', adminQuoteQuantity: '10', adminQuoteDeliveryDays: '7' }));
      mockPrisma.printServiceInquiry.update.mockResolvedValue({});
      const result = await service.quote('1', {
        adminQuoteUnitPrice: 10, adminQuoteQuantity: 10, adminQuoteDeliveryDays: 7,
      }, 'admin1');
      expect(result.status).toBe('quoted');
    });
  });
});
