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

const mockMediaService = {
  uploadFile: jest.fn(),
};

jest.mock('../media/media.service', () => ({
  MediaService: jest.fn(() => mockMediaService),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { BannerService } from './banner.service';
import { MediaService } from '../media/media.service';
import { NotFoundException } from '@nestjs/common';

describe('BannerService', () => {
  let service: BannerService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [BannerService, MediaService],
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
    it('应使用 URL 创建 Banner', async () => {
      mockPrisma.banner.create.mockResolvedValue({ id: 'new', title: '新', imageUrl: 'https://a.jpg' });
      const result = await service.create({ imageUrl: 'https://a.jpg', title: '新' });
      expect(result.title).toBe('新');
      expect(result.imageUrl).toBe('https://a.jpg');
      expect(mockMediaService.uploadFile).not.toHaveBeenCalled();
    });

    it('应使用文件上传创建 Banner', async () => {
      const mockFile = { originalname: 'test.jpg', mimetype: 'image/jpeg', buffer: Buffer.from('x'), size: 100 } as Express.Multer.File;
      mockMediaService.uploadFile.mockResolvedValue({ fileUrl: '/storage/banners/123.jpg', fileKey: 'banners/123.jpg' });
      mockPrisma.banner.create.mockResolvedValue({ id: 'new', title: '新', imageUrl: '/storage/banners/123.jpg' });

      const result = await service.create({ title: '新' }, mockFile);
      expect(mockMediaService.uploadFile).toHaveBeenCalledWith(mockFile, 'banners');
      expect(result.imageUrl).toBe('/storage/banners/123.jpg');
    });

    it('应无图片时抛出错误', async () => {
      await expect(service.create({ title: '新' })).rejects.toThrow('请提供图片');
    });
  });

  describe('update', () => {
    it('应 Banner 不存在时抛出 NotFoundException', async () => {
      mockPrisma.banner.findUnique.mockResolvedValue(null);
      await expect(service.update('bad', { title: 'x' })).rejects.toThrow(NotFoundException);
    });

    it('应成功更新（保留原图片）', async () => {
      mockPrisma.banner.findUnique.mockResolvedValue({ id: '1' });
      mockPrisma.banner.update.mockResolvedValue({ id: '1', title: '新' });
      const result = await service.update('1', { title: '新' });
      expect(result.title).toBe('新');
      expect(mockMediaService.uploadFile).not.toHaveBeenCalled();
    });

    it('应成功更新（替换图片）', async () => {
      const mockFile = { originalname: 'new.jpg', mimetype: 'image/jpeg', buffer: Buffer.from('x'), size: 100 } as Express.Multer.File;
      mockMediaService.uploadFile.mockResolvedValue({ fileUrl: '/storage/banners/456.jpg', fileKey: 'banners/456.jpg' });
      mockPrisma.banner.findUnique.mockResolvedValue({ id: '1' });
      mockPrisma.banner.update.mockResolvedValue({ id: '1', title: '新', imageUrl: '/storage/banners/456.jpg' });

      const result = await service.update('1', { title: '新' }, mockFile);
      expect(mockMediaService.uploadFile).toHaveBeenCalledWith(mockFile, 'banners');
      expect(result.imageUrl).toBe('/storage/banners/456.jpg');
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
