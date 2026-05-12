let mockPrisma: any;

jest.mock('@prisma/client', () => {
  mockPrisma = {
    category: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';

describe('CategoryService', () => {
  let service: CategoryService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoryService],
    }).compile();
    service = module.get<CategoryService>(CategoryService);
  });

  describe('getTree', () => {
    it('应返回分类树', async () => {
      mockPrisma.category.findMany.mockResolvedValue([
        { id: '1', name: '根分类', slug: 'root', icon: null, imageUrl: null, description: null, parentId: null, sortOrder: 0, isVisible: true },
        { id: '2', name: '子分类', slug: 'child', icon: null, imageUrl: null, description: null, parentId: '1', sortOrder: 0, isVisible: true },
      ]);
      const tree = await service.getTree();
      expect(tree).toHaveLength(1);
      expect(tree[0]!.name).toBe('根分类');
      expect(tree[0]!.children).toHaveLength(1);
      expect(tree[0]!.children[0]!.name).toBe('子分类');
    });
  });

  describe('getBySlug', () => {
    it('应返回分类详情', async () => {
      mockPrisma.category.findUnique.mockResolvedValue({
        id: '1', name: '分类', slug: 'cat', children: [], products: [],
      });
      const result = await service.getBySlug('cat');
      expect(result.name).toBe('分类');
    });

    it('应分类不存在时抛出 NotFoundException', async () => {
      mockPrisma.category.findUnique.mockResolvedValue(null);
      await expect(service.getBySlug('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('应 slug 重复时抛出 ConflictException', async () => {
      mockPrisma.category.findUnique.mockResolvedValue({ id: 'existing' });
      await expect(
        service.create({ name: '新分类', slug: 'existing' }),
      ).rejects.toThrow(ConflictException);
    });

    it('应父分类不存在时抛出 BadRequestException', async () => {
      mockPrisma.category.findUnique
        .mockResolvedValueOnce(null) // slug 检查
        .mockResolvedValueOnce(null); // parentId 检查
      await expect(
        service.create({ name: '分类', slug: 'new', parentId: 'bad-parent' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('应成功创建分类', async () => {
      mockPrisma.category.findUnique.mockResolvedValue(null);
      mockPrisma.category.create.mockResolvedValue({ id: 'new', name: '新分类', slug: 'new' });
      const result = await service.create({ name: '新分类', slug: 'new' });
      expect(result.name).toBe('新分类');
    });
  });

  describe('update', () => {
    it('应分类不存在时抛出 NotFoundException', async () => {
      mockPrisma.category.findUnique.mockResolvedValue(null);
      await expect(
        service.update('bad-id', { name: 'x' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('应成功更新', async () => {
      mockPrisma.category.findUnique.mockResolvedValue({ id: '1', name: '旧', slug: 'old' });
      mockPrisma.category.update.mockResolvedValue({ id: '1', name: '新', slug: 'old' });
      const result = await service.update('1', { name: '新' });
      expect(result.name).toBe('新');
    });
  });

  describe('delete', () => {
    it('应有子分类时报错', async () => {
      mockPrisma.category.findUnique.mockResolvedValue({
        id: '1', children: [{ id: '2' }], products: [],
      });
      await expect(service.delete('1')).rejects.toThrow('请先删除子分类');
    });

    it('应有关联产品时报错', async () => {
      mockPrisma.category.findUnique.mockResolvedValue({
        id: '1', children: [], products: [{ productId: 'p1' }],
      });
      await expect(service.delete('1')).rejects.toThrow('该分类下有关联产品');
    });

    it('应成功删除', async () => {
      mockPrisma.category.findUnique.mockResolvedValue({
        id: '1', children: [], products: [],
      });
      mockPrisma.category.delete.mockResolvedValue({ id: '1' });
      const result = await service.delete('1');
      expect(result.id).toBe('1');
    });
  });
});
