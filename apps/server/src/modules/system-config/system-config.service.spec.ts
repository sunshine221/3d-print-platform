let mockPrisma: any;

jest.mock('@prisma/client', () => {
  mockPrisma = {
    systemConfig: {
      findMany: jest.fn(),
      upsert: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

import { Test, TestingModule } from '@nestjs/testing';
import { SystemConfigService } from './system-config.service';

describe('SystemConfigService', () => {
  let service: SystemConfigService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [SystemConfigService],
    }).compile();
    service = module.get<SystemConfigService>(SystemConfigService);
  });

  describe('getAll', () => {
    it('应按 groupName 分组返回', async () => {
      mockPrisma.systemConfig.findMany.mockResolvedValue([
        { key: 'site_name', value: '3D打印', groupName: 'general' },
        { key: 'logo', value: 'https://a.png', groupName: 'general' },
        { key: 'smtp_host', value: 'smtp.test.com', groupName: 'email' },
      ]);
      const result = await service.getAll();
      expect(result['general']).toBeDefined();
      expect(result['general']!['site_name']).toBe('3D打印');
      expect(result['email']).toBeDefined();
    });
  });

  describe('get', () => {
    it('应返回指定分组', async () => {
      mockPrisma.systemConfig.findMany.mockResolvedValue([
        { key: 'site_name', value: '3D打印', groupName: 'general' },
      ]);
      const result = await service.get('general');
      expect(result['site_name']).toBe('3D打印');
    });
  });

  describe('set', () => {
    it('应 upsert 配置', async () => {
      mockPrisma.systemConfig.upsert.mockResolvedValue({ key: 'k', value: 'v', groupName: 'g' });
      const result = await service.set('k', 'v', 'g');
      expect(result.value).toBe('v');
    });
  });

  describe('setBatch', () => {
    it('应批量 upsert 并返回全部分组', async () => {
      mockPrisma.systemConfig.upsert.mockResolvedValue(null);
      mockPrisma.systemConfig.findMany.mockResolvedValue([
        { key: 'a', value: '1', groupName: 'g' },
      ]);
      const result = await service.setBatch([{ key: 'a', value: '1', groupName: 'g' }]);
      expect(result['g']!['a']).toBe('1');
    });
  });
});
