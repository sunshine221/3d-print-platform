let mockPrisma: any;

jest.mock('@prisma/client', () => {
  mockPrisma = {
    product: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    sKU: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => mockPrisma),
    Prisma: {
      Decimal: jest.fn((v: number) => v), // 简单返回数字
    },
  };
});

jest.mock('@3d-print/utils', () => ({
  generateOrderNo: jest.fn().mockReturnValue('SKU-20260512-ABCD'),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { SkuService } from './sku.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('SkuService', () => {
  let service: SkuService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [SkuService],
    }).compile();
    service = module.get<SkuService>(SkuService);
  });

  describe('findByProductId', () => {
    it('应返回产品 SKU 列表', async () => {
      mockPrisma.sKU.findMany.mockResolvedValue([
        { id: 's1', price: 29.9, skuCode: 'SKU-001' },
      ]);
      const result = await service.findByProductId('p1');
      expect(result).toHaveLength(1);
      expect(result[0]!.price).toBe(29.9);
    });
  });

  describe('create', () => {
    it('应产品不存在时抛出 NotFoundException', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);
      await expect(
        service.create('bad', { specCombo: { 材质: '树脂' }, price: 99 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('应 SKU 编码重复时抛出 ConflictException', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ id: 'p1' });
      mockPrisma.sKU.findUnique.mockResolvedValue({ id: 'existing' });
      await expect(
        service.create('p1', { specCombo: { 材质: '树脂' }, price: 99 }),
      ).rejects.toThrow(ConflictException);
    });

    it('应成功创建 SKU', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ id: 'p1' });
      mockPrisma.sKU.findUnique.mockResolvedValue(null);
      mockPrisma.sKU.create.mockResolvedValue({
        id: 's1', skuCode: 'SKU-20260512-ABCD', price: 99,
      });
      mockPrisma.sKU.findMany.mockResolvedValue([]);
      mockPrisma.product.update.mockResolvedValue({});

      const result = await service.create('p1', {
        specCombo: { 材质: '树脂', 颜色: '白色' },
        price: 99,
      });
      expect(result.price).toBe(99);
      expect(mockPrisma.product.update).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('应 SKU 不存在时抛出 NotFoundException', async () => {
      mockPrisma.sKU.findFirst.mockResolvedValue(null);
      await expect(service.delete('p1', 'bad-sku')).rejects.toThrow(NotFoundException);
    });

    it('应成功删除', async () => {
      mockPrisma.sKU.findFirst.mockResolvedValue({ id: 's1', productId: 'p1' });
      mockPrisma.sKU.delete.mockResolvedValue({});
      mockPrisma.sKU.findMany.mockResolvedValue([]);
      mockPrisma.product.update.mockResolvedValue({});

      const result = await service.delete('p1', 's1');
      expect(result).toEqual({ success: true });
    });
  });
});
