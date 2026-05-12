let mockPrisma: any;

jest.mock('@prisma/client', () => {
  mockPrisma = {
    banner: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

import { Test, TestingModule } from '@nestjs/testing';
import { BannerService } from './banner.service';
import { NotFoundException } from '@nestjs/common';

describe('BannerService', () => {
  let service: BannerService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [BannerService],
    }).compile();
    service = module.get<BannerService>(BannerService);
  });

  describe('findActive', () => {
    it('应返回启用的 Banner 按排序排序', async () => {
      mockPrisma.banner.findMany.mockResolvedValue([
        { id: '1', title: 'B1', isActive: true, sortOrder: 1 },
      ]);
      const result = await service.findActive();
      expect(result).toHaveLength(1);
    });
  });

  describe('findAll', () => {
    it('应返回分页列表', async () => {
      mockPrisma.banner.findMany.mockResolvedValue([{ id: '1' }]);
      mockPrisma.banner.count.mockResolvedValue(1);
      const result = await service.findAll({ page: 1, pageSize: 20 });
      expect(result.items).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });
  });

  describe('findById', () => {
    it('应返回 Banner', async () => {
      mockPrisma.banner.findUnique.mockResolvedValue({ id: '1', title: 'B1' });
      const result = await service.findById('1');
      expect(result.title).toBe('B1');
    });

    it('应 Banner 不存在时抛出 NotFoundException', async () => {
      mockPrisma.banner.findUnique.mockResolvedValue(null);
      await expect(service.findById('bad')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('应创建 Banner', async () => {
      mockPrisma.banner.create.mockResolvedValue({ id: 'new', title: '新' });
      const result = await service.create({ imageUrl: 'https://a.jpg', title: '新' });
      expect(result.title).toBe('新');
    });
  });

  describe('update', () => {
    it('应 Banner 不存在时抛出 NotFoundException', async () => {
      mockPrisma.banner.findUnique.mockResolvedValue(null);
      await expect(service.update('bad', { title: 'x' })).rejects.toThrow(NotFoundException);
    });

    it('应成功更新', async () => {
      mockPrisma.banner.findUnique.mockResolvedValue({ id: '1' });
      mockPrisma.banner.update.mockResolvedValue({ id: '1', title: '新' });
      const result = await service.update('1', { title: '新' });
      expect(result.title).toBe('新');
    });
  });

  describe('delete', () => {
    it('应成功删除', async () => {
      mockPrisma.banner.findUnique.mockResolvedValue({ id: '1' });
      mockPrisma.banner.delete.mockResolvedValue({ id: '1' });
      const result = await service.delete('1');
      expect(result.success).toBe(true);
    });
  });
});
