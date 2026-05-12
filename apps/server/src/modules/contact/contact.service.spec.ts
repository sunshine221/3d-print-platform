let mockPrisma: any;

jest.mock('@prisma/client', () => {
  mockPrisma = {
    contactMessage: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

import { Test, TestingModule } from '@nestjs/testing';
import { ContactService } from './contact.service';
import { NotFoundException } from '@nestjs/common';

describe('ContactService', () => {
  let service: ContactService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContactService],
    }).compile();
    service = module.get<ContactService>(ContactService);
  });

  describe('create', () => {
    it('应创建消息', async () => {
      mockPrisma.contactMessage.create.mockResolvedValue({
        id: '1', name: '张三', email: 'a@b.com', message: '你好',
      });
      const result = await service.create({ name: '张三', email: 'a@b.com', message: '你好' });
      expect(result.name).toBe('张三');
    });
  });

  describe('findAll', () => {
    it('应返回分页列表', async () => {
      mockPrisma.contactMessage.findMany.mockResolvedValue([{ id: '1' }]);
      mockPrisma.contactMessage.count.mockResolvedValue(1);
      const result = await service.findAll({ page: 1, pageSize: 20 });
      expect(result.items).toHaveLength(1);
    });
  });

  describe('findById', () => {
    it('应消息不存在时抛出 NotFoundException', async () => {
      mockPrisma.contactMessage.findUnique.mockResolvedValue(null);
      await expect(service.findById('bad')).rejects.toThrow(NotFoundException);
    });
  });

  describe('markRead', () => {
    it('应标记已读', async () => {
      mockPrisma.contactMessage.findUnique.mockResolvedValue({ id: '1' });
      mockPrisma.contactMessage.update.mockResolvedValue({ id: '1', isRead: true });
      const result = await service.markRead('1');
      expect(result.isRead).toBe(true);
    });
  });

  describe('reply', () => {
    it('应回复并标记已读', async () => {
      mockPrisma.contactMessage.findUnique.mockResolvedValue({ id: '1' });
      mockPrisma.contactMessage.update.mockResolvedValue({
        id: '1', reply: '收到', isRead: true,
      });
      const result = await service.reply('1', '收到');
      expect(result.reply).toBe('收到');
      expect(result.isRead).toBe(true);
    });
  });
});
