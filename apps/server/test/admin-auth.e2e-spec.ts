import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

let mockPrisma: any;

jest.mock('@prisma/client', () => {
  mockPrisma = {
    adminUser: { findUnique: jest.fn(), update: jest.fn() },
    refreshToken: { findUnique: jest.fn(), create: jest.fn(), delete: jest.fn(), deleteMany: jest.fn() },
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed'),
  compare: jest.fn().mockResolvedValue(true),
}));

import { AdminAuthController } from '../src/modules/admin-auth/admin-auth.controller';
import { AdminAuthService } from '../src/modules/admin-auth/admin-auth.service';
import { JwtAdminGuard } from '../src/common/guards/jwt-admin.guard';
import { JwtAdminStrategy } from '../src/modules/auth/strategies/jwt-admin.strategy';

describe('AdminAuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [PassportModule],
      controllers: [AdminAuthController],
      providers: [
        AdminAuthService,
        JwtAdminStrategy,
        {
          provide: JwtService,
          useValue: { sign: jest.fn().mockReturnValue('admin-mock-token') },
        },
      ],
    })
      .overrideGuard(JwtAdminGuard)
      .useValue({
        canActivate: (context: any) => {
          const req = context.switchToHttp().getRequest();
          req.user = { id: 'admin-id', email: 'admin@ymbj.online', roleId: 'role-id' };
          return true;
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/admin/auth/login', () => {
    it('应参数不全时返回 400', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/admin/auth/login')
        .send({ email: 'admin@ymbj.online' });
      expect(res.status).toBe(400);
    });

    it('应成功登录返回 200', async () => {
      mockPrisma.adminUser.findUnique.mockResolvedValue({
        id: 'admin-id', email: 'admin@ymbj.online', passwordHash: 'hash',
        status: 'active', role: { slug: 'admin' }, name: 'Admin',
      });
      mockPrisma.refreshToken.create.mockResolvedValue({});
      mockPrisma.adminUser.update.mockResolvedValue({});

      const res = await request(app.getHttpServer())
        .post('/api/v1/admin/auth/login')
        .send({ email: 'admin@ymbj.online', password: 'admin123' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body.user.role).toBe('admin');
    });
  });

  describe('POST /api/v1/admin/auth/refresh', () => {
    it('应成功刷新', async () => {
      mockPrisma.refreshToken.findUnique.mockResolvedValue({
        id: 't', adminUserId: 'admin-id', token: 'old',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
      mockPrisma.refreshToken.delete.mockResolvedValue({});
      mockPrisma.adminUser.findUnique.mockResolvedValue({
        id: 'admin-id', email: 'admin@ymbj.online', status: 'active',
        role: { slug: 'admin' }, name: 'A',
      });
      mockPrisma.refreshToken.create.mockResolvedValue({});

      const res = await request(app.getHttpServer())
        .post('/api/v1/admin/auth/refresh')
        .send({ refreshToken: 'old' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
    });
  });

  describe('GET /api/v1/admin/auth/me', () => {
    it('应返回管理员信息', async () => {
      mockPrisma.adminUser.findUnique.mockResolvedValue({
        id: 'admin-id', email: 'admin@ymbj.online', name: 'Admin', avatarUrl: null,
        role: { slug: 'admin', permissions: ['all'] },
      });

      const res = await request(app.getHttpServer()).get('/api/v1/admin/auth/me');
      expect(res.status).toBe(200);
      expect(res.body.role).toBe('admin');
      expect(res.body.permissions).toEqual(['all']);
    });
  });

  describe('POST /api/v1/admin/auth/logout', () => {
    it('应成功注销', async () => {
      mockPrisma.refreshToken.deleteMany.mockResolvedValue({ count: 1 });
      const res = await request(app.getHttpServer()).post('/api/v1/admin/auth/logout');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/v1/admin/auth/change-password', () => {
    it('应成功修改密码', async () => {
      mockPrisma.adminUser.findUnique.mockResolvedValue({ id: 'admin-id', passwordHash: 'h' });
      mockPrisma.adminUser.update.mockResolvedValue({});

      const res = await request(app.getHttpServer())
        .post('/api/v1/admin/auth/change-password')
        .send({ currentPassword: 'correct', newPassword: 'new123456' });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('密码修改成功');
    });
  });
});
