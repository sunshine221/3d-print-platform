let mockPrisma: any;

jest.mock('@prisma/client', () => {
  mockPrisma = {
    page: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

import { Test, TestingModule } from '@nestjs/testing';
import { PageService } from './page.service';
import { NotFoundException } from '@nestjs/common';

describe('PageService', () => {
  let service: PageService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [PageService],
    }).compile();
    service = module.get<PageService>(PageService);
  });

  describe('findBySlug', () => {
    it('应返回页面', async () => {
      mockPrisma.page.findUnique.mockResolvedValue({
        id: '1', title: '关于我们', slug: 'about', content: '<p>内容</p>',
      });
      const result = await service.findBySlug('about');
      expect(result.title).toBe('关于我们');
    });

    it('应页面不存在时抛出 NotFoundException', async () => {
      mockPrisma.page.findUnique.mockResolvedValue(null);
      await expect(service.findBySlug('bad')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('应返回分页列表', async () => {
      mockPrisma.page.findMany.mockResolvedValue([{ id: '1' }]);
      mockPrisma.page.count.mockResolvedValue(1);
      const result = await service.findAll({ page: 1, pageSize: 20 });
      expect(result.items).toHaveLength(1);
    });
  });

  describe('findById', () => {
    it('应返回页面', async () => {
      mockPrisma.page.findUnique.mockResolvedValue({ id: '1', title: 'T' });
      const result = await service.findById('1');
      expect(result.title).toBe('T');
    });

    it('应页面不存在时抛出 NotFoundException', async () => {
      mockPrisma.page.findUnique.mockResolvedValue(null);
      await expect(service.findById('bad')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('应成功更新', async () => {
      mockPrisma.page.findUnique.mockResolvedValue({ id: '1' });
      mockPrisma.page.update.mockResolvedValue({ id: '1', title: '新' });
      const result = await service.update('1', { title: '新' });
      expect(result.title).toBe('新');
    });
  });
});
