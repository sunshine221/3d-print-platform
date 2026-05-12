import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

let mockPrisma: any;

jest.mock('@prisma/client', () => {
  mockPrisma = {
    user: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
    verificationCode: { findFirst: jest.fn(), create: jest.fn(), update: jest.fn() },
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
    const dto = { email: 'test@test.com', password: 'password123', code: '1234', name: 'Test' };

    it('应验证码无效时抛出 BadRequestException', async () => {
      mockPrisma.verificationCode.findFirst.mockResolvedValue(null);
      await expect(service.register(dto)).rejects.toThrow(BadRequestException);
    });

    it('应验证码过期时抛出 BadRequestException', async () => {
      mockPrisma.verificationCode.findFirst.mockResolvedValue({
        id: 'code-id', email: 'test@test.com', code: '1234', type: 'register',
        used: false, expiresAt: new Date('2020-01-01'),
      });
      await expect(service.register(dto)).rejects.toThrow('验证码无效或已过期');
    });

    it('应邮箱已注册时抛出 ConflictException', async () => {
      mockPrisma.verificationCode.findFirst.mockResolvedValue({
        id: 'code-id', email: 'test@test.com', code: '1234', type: 'register',
        used: false, expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      });
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'existing' });
      await expect(service.register(dto)).rejects.toThrow(ConflictException);
    });

    it('应成功注册返回 token pair', async () => {
      mockPrisma.verificationCode.findFirst.mockResolvedValue({
        id: 'code-id', email: 'test@test.com', code: '1234', type: 'register',
        used: false, expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      });
      mockPrisma.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      mockPrisma.user.create.mockResolvedValue({ id: 'new-id', email: 'test@test.com', name: 'Test' });
      mockPrisma.verificationCode.update.mockResolvedValue({});

      const result = await service.register(dto);
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('expiresIn');
    });
  });

  describe('login', () => {
    const dto = { email: 'test@test.com', password: 'password123' };

    it('应邮箱不存在抛出 UnauthorizedException', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('应账号禁用抛出 UnauthorizedException', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-id', email: 'test@test.com', passwordHash: 'hash', status: 'disabled',
      });
      await expect(service.login(dto)).rejects.toThrow('账号已被禁用');
    });

    it('应密码错误抛出 UnauthorizedException', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-id', email: 'test@test.com', passwordHash: 'hash', status: 'active',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('应成功登录返回 token pair', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-id', email: 'test@test.com', passwordHash: 'hash', status: 'active',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockPrisma.refreshToken.create.mockResolvedValue({});

      const result = await service.login(dto);
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
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
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-id', email: 't@t.com', status: 'active' });
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

  describe('sendCode', () => {
    it('应创建验证码', async () => {
      mockPrisma.verificationCode.create.mockResolvedValue({});
      const result = await service.sendCode('test@test.com');
      expect(result).toEqual({ message: '验证码已发送' });
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
        id: 'u', email: 't@t.com', name: 'T', phone: null, avatarUrl: null,
      });
      const result = await service.getMe('u');
      expect(result.id).toBe('u');
      expect(result.email).toBe('t@t.com');
    });
  });
});
