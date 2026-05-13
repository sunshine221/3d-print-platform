import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

let mockPrisma: any;

jest.mock('@prisma/client', () => {
  mockPrisma = {
    user: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
    refreshToken: { findUnique: jest.fn(), create: jest.fn(), delete: jest.fn(), deleteMany: jest.fn() },
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: { sign: jest.fn().mockReturnValue('mock-token') },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    const dto = {
      phone: '13800001111',
      password: 'password123',
      confirmPassword: 'password123',
    };

    it('应两次密码不一致时抛出 BadRequestException', async () => {
      await expect(
        service.register({ ...dto, confirmPassword: 'different' }),
      ).rejects.toThrow('两次密码不一致');
    });

    it('应手机号已注册时抛出 ConflictException', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({ id: 'existing' });
      await expect(service.register(dto)).rejects.toThrow(ConflictException);
    });

    it('应成功注册返回 token pair 和用户信息', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      mockPrisma.user.create.mockResolvedValue({
        id: 'new-id', phone: '13800001111', username: 'user_a1b2c3', name: '用户0001',
      });
      mockPrisma.refreshToken.create.mockResolvedValue({});

      const result = await service.register(dto);
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
      expect(result.user).toHaveProperty('username');
    });
  });

  describe('login', () => {
    const dto = { account: '13800001111', password: 'password123' };

    it('应账号不存在抛出 UnauthorizedException', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('应账号禁用抛出 UnauthorizedException', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-id', phone: '13800001111', passwordHash: 'hash', status: 'disabled',
      });
      await expect(service.login(dto)).rejects.toThrow('账号已被禁用');
    });

    it('应密码错误抛出 UnauthorizedException', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-id', phone: '13800001111', passwordHash: 'hash', status: 'active',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('应成功登录返回 token pair', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-id', phone: '13800001111', passwordHash: 'hash', status: 'active',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockPrisma.refreshToken.create.mockResolvedValue({});

      const result = await service.login(dto);
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('应用 username 登录', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-id', phone: '13800001111', passwordHash: 'hash', status: 'active',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockPrisma.refreshToken.create.mockResolvedValue({});

      const result = await service.login({ account: 'user_a1b2c3', password: 'password123' });
      expect(result).toHaveProperty('accessToken');
    });
  });

  describe('refresh', () => {
    it('应无效 refresh token 时抛出 UnauthorizedException', async () => {
      mockPrisma.refreshToken.findUnique.mockResolvedValue(null);
      await expect(service.refresh('invalid')).rejects.toThrow(UnauthorizedException);
    });

    it('应成功刷新并吊销旧 token', async () => {
      mockPrisma.refreshToken.findUnique.mockResolvedValue({
        id: 'token-id', userId: 'user-id', token: 'old',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
      mockPrisma.refreshToken.delete.mockResolvedValue({});
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-id', phone: '13800001111', status: 'active',
      });
      mockPrisma.refreshToken.create.mockResolvedValue({});

      const result = await service.refresh('old');
      expect(result).toHaveProperty('accessToken');
      expect(mockPrisma.refreshToken.delete).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('应删除所有 refresh token', async () => {
      mockPrisma.refreshToken.deleteMany.mockResolvedValue({ count: 2 });
      const result = await service.logout('user-id');
      expect(result).toEqual({ success: true });
    });
  });

  describe('forgotPassword', () => {
    it('应返回提示信息', async () => {
      const result = await service.forgotPassword('13800001111');
      expect(result).toHaveProperty('message');
    });
  });

  describe('resetPassword', () => {
    it('应成功重置密码', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'u', phone: '13800001111' });
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hash');
      mockPrisma.user.update.mockResolvedValue({});
      const result = await service.resetPassword({
        phone: '13800001111',
        newPassword: 'new123456',
      });
      expect(result).toEqual({ message: '密码重置成功' });
    });
  });

  describe('changePassword', () => {
    it('应当前密码错误时抛出 BadRequestException', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'u', passwordHash: 'h' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(
        service.changePassword('u', { currentPassword: 'w', newPassword: 'n123456' }),
      ).rejects.toThrow('当前密码错误');
    });

    it('应成功修改密码', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'u', passwordHash: 'h' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hash');
      mockPrisma.user.update.mockResolvedValue({});
      const result = await service.changePassword('u', { currentPassword: 'c', newPassword: 'n123456' });
      expect(result).toEqual({ message: '密码修改成功' });
    });
  });

  describe('getMe', () => {
    it('应返回用户信息', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u', phone: '13800001111', username: 'user_a1b2c3',
        name: 'T', avatarUrl: null,
      });
      const result = await service.getMe('u');
      expect(result.id).toBe('u');
      expect(result.username).toBe('user_a1b2c3');
      expect(result.phone).toBe('13800001111');
    });
  });
});
