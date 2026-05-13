import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

let mockPrisma: any;

jest.mock('@prisma/client', () => {
  mockPrisma = {
    adminUser: { findUnique: jest.fn(), update: jest.fn() },
    refreshToken: { findUnique: jest.fn(), create: jest.fn(), delete: jest.fn(), deleteMany: jest.fn() },
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

import { AdminAuthService } from './admin-auth.service';

describe('AdminAuthService', () => {
  let service: AdminAuthService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminAuthService,
        {
          provide: JwtService,
          useValue: { sign: jest.fn().mockReturnValue('admin-mock-token') },
        },
      ],
    }).compile();

    service = module.get<AdminAuthService>(AdminAuthService);
  });

  describe('login', () => {
    const dto = { account: 'admin', password: 'admin' };

    it('应账号不存在抛出 UnauthorizedException', async () => {
      mockPrisma.adminUser.findUnique.mockResolvedValue(null);
      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('应账号禁用抛出 UnauthorizedException', async () => {
      mockPrisma.adminUser.findUnique.mockResolvedValue({
        id: 'a', username: 'admin', passwordHash: 'h', status: 'disabled',
        role: { slug: 'admin' }, name: 'A',
      });
      await expect(service.login(dto)).rejects.toThrow('账号已被禁用');
    });

    it('应密码错误抛出 UnauthorizedException', async () => {
      mockPrisma.adminUser.findUnique.mockResolvedValue({
        id: 'a', username: 'admin', passwordHash: 'h', status: 'active',
        role: { slug: 'admin' }, name: 'A',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('应成功登录返回 token 和用户信息', async () => {
      mockPrisma.adminUser.findUnique.mockResolvedValue({
        id: 'a', username: 'admin', passwordHash: 'h', status: 'active',
        role: { slug: 'admin' }, name: 'Admin',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockPrisma.refreshToken.create.mockResolvedValue({});
      mockPrisma.adminUser.update.mockResolvedValue({});

      const result = await service.login(dto);
      expect(result).toHaveProperty('accessToken');
      expect(result.user.role).toBe('admin');
    });
  });

  describe('refresh', () => {
    it('应无效 refresh token 时抛出 UnauthorizedException', async () => {
      mockPrisma.refreshToken.findUnique.mockResolvedValue(null);
      await expect(service.refresh('invalid')).rejects.toThrow(UnauthorizedException);
    });

    it('应成功刷新', async () => {
      mockPrisma.refreshToken.findUnique.mockResolvedValue({
        id: 't', adminUserId: 'a', token: 'old',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
      mockPrisma.refreshToken.delete.mockResolvedValue({});
      mockPrisma.adminUser.findUnique.mockResolvedValue({
        id: 'a', username: 'admin', status: 'active',
        role: { slug: 'admin' }, name: 'A',
      });
      mockPrisma.refreshToken.create.mockResolvedValue({});

      const result = await service.refresh('old');
      expect(result).toHaveProperty('accessToken');
    });
  });

  describe('logout', () => {
    it('应删除所有 refresh token', async () => {
      mockPrisma.refreshToken.deleteMany.mockResolvedValue({ count: 1 });
      const result = await service.logout('a');
      expect(result).toEqual({ success: true });
    });
  });

  describe('getMe', () => {
    it('应返回管理员信息含权限', async () => {
      mockPrisma.adminUser.findUnique.mockResolvedValue({
        id: 'a', username: 'admin', name: 'Admin', avatarUrl: null,
        role: { slug: 'admin', permissions: ['all'] },
      });
      const result = await service.getMe('a');
      expect(result.role).toBe('admin');
      expect(result.permissions).toEqual(['all']);
    });
  });

  describe('changePassword', () => {
    it('应当前密码错误时抛出 BadRequestException', async () => {
      mockPrisma.adminUser.findUnique.mockResolvedValue({ id: 'a', passwordHash: 'h' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(
        service.changePassword('a', { currentPassword: 'w', newPassword: 'n123456' }),
      ).rejects.toThrow('当前密码错误');
    });

    it('应成功修改密码', async () => {
      mockPrisma.adminUser.findUnique.mockResolvedValue({ id: 'a', passwordHash: 'h' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new');
      mockPrisma.adminUser.update.mockResolvedValue({});
      const result = await service.changePassword('a', { currentPassword: 'c', newPassword: 'n123456' });
      expect(result).toEqual({ message: '密码修改成功' });
    });
  });
});
