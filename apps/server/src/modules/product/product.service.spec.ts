let mockPrisma: any;

jest.mock('@prisma/client', () => {
  mockPrisma = {
    product: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
    },
    productCategory: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
    productImage: {
      create: jest.fn(),
      updateMany: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
      aggregate: jest.fn().mockResolvedValue({ _max: { sortOrder: 0 } }),
    },
    model3D: {
      upsert: jest.fn(),
      findUnique: jest.fn(),
    },
    sKU: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => mockPrisma),
    Prisma: {
      Decimal: jest.fn((v: number) => v),
    },
  };
});

jest.mock('@3d-print/utils', () => ({
  generateOrderNo: jest.fn().mockReturnValue('SKU-20260512-ABCD'),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('ProductService', () => {
  let service: ProductService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductService],
    }).compile();
    service = module.get<ProductService>(ProductService);
  });

  describe('findPublished', () => {
    it('应返回分页产品列表', async () => {
      mockPrisma.product.findMany.mockResolvedValue([
        {
          id: '1', name: '产品A', slug: 'a', subtitle: null, thumbnailUrl: null,
          productType: 'standard', materials: ['树脂'], techniques: ['SLA'],
          status: 'published', viewCount: 0, createdAt: new Date(),
          categories: [{ category: { id: 'c1', name: '分类A', slug: 'cata' } }],
          skus: [{ price: 29.9 }],
        },
      ]);
      mockPrisma.product.count.mockResolvedValue(1);

      const result = await service.findPublished({ page: 1, pageSize: 10 });
      expect(result.items).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
      expect(result.items[0].minPrice).toBe(29.9);
    });
  });

  describe('findBySlug', () => {
    it('应返回产品详情', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({
        id: '1', name: '产品', slug: 'prod', status: 'published',
        description: '描述', specs: [], tolerance: null,
        categories: [{ category: { id: 'c1', name: '分类', slug: 'cat' } }],
        skus: [{ id: 's1', price: 99, status: 'active' }],
        images: [], model3d: null, viewCount: 0,
        productType: 'standard', materials: [], techniques: [],
        subtitle: null, thumbnailUrl: null, seoTitle: null, seoDescription: null, seoKeywords: null,
        createdAt: new Date(), updatedAt: new Date(),
      });
      mockPrisma.product.update.mockResolvedValue({});

      const result = await service.findBySlug('prod');
      expect(result.name).toBe('产品');
      expect(result.skus[0].price).toBe(99);
    });

    it('应产品不存在时抛出 NotFoundException', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);
      await expect(service.findBySlug('nope')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('应 slug 重复时抛出 ConflictException', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ id: 'existing' });
      await expect(
        service.create({ name: '产品', slug: 'existing', productType: 'standard' }),
      ).rejects.toThrow(ConflictException);
    });

    it('应成功创建产品', async () => {
      mockPrisma.product.findUnique
        .mockResolvedValueOnce(null) // slug check
        .mockResolvedValueOnce({     // create中调用 findById
          id: 'new', name: '产品', slug: 'new', status: 'draft',
          categories: [], skus: [], images: [], model3d: null,
          specs: [], productType: 'standard', materials: [], techniques: [],
          description: null, subtitle: null, thumbnailUrl: null, tolerance: null,
          seoTitle: null, seoDescription: null, seoKeywords: null,
          createdAt: new Date(), updatedAt: new Date(), viewCount: 0,
        });
      mockPrisma.product.create.mockResolvedValue({ id: 'new' });

      const result = await service.create({ name: '产品', slug: 'new', productType: 'standard' });
      expect(result.name).toBe('产品');
    });
  });

  describe('delete', () => {
    it('应产品不存在时抛出 NotFoundException', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);
      await expect(service.delete('bad')).rejects.toThrow(NotFoundException);
    });

    it('应成功删除', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ id: '1' });
      mockPrisma.product.delete.mockResolvedValue({});
      const result = await service.delete('1');
      expect(result).toEqual({ success: true });
    });
  });

  describe('addImage', () => {
    it('应成功添加图片', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ id: '1' });
      mockPrisma.productImage.create.mockResolvedValue({
        id: 'img1', url: 'http://img.jpg', sortOrder: 0, isPrimary: false,
      });
      const result = await service.addImage('1', { url: 'http://img.jpg' });
      expect(result.url).toBe('http://img.jpg');
    });
  });

  describe('upsertModel3D', () => {
    it('应成功上传 3D 模型', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ id: '1' });
      mockPrisma.model3D.upsert.mockResolvedValue({
        id: 'm1', fileUrl: 'http://model.glb', fileName: 'model.glb', fileSize: 1000,
      });
      const result = await service.upsertModel3D('1', { fileUrl: 'http://model.glb', fileName: 'model.glb', fileSize: 1000 });
      expect(result.fileUrl).toBe('http://model.glb');
    });
  });
});
