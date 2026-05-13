import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

let mockPrisma: any;

jest.mock('@prisma/client', () => {
  mockPrisma = {
    user: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
    refreshToken: { findUnique: jest.fn(), create: jest.fn(), delete: jest.fn(), deleteMany: jest.fn() },
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed'),
  compare: jest.fn().mockResolvedValue(true),
}));

import { AuthController } from '../src/modules/auth/auth.controller';
import { AuthService } from '../src/modules/auth/auth.service';
import { JwtAuthGuard } from '../src/common/guards/jwt-auth.guard';
import { JwtStrategy } from '../src/modules/auth/strategies/jwt.strategy';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [PassportModule],
      controllers: [AuthController],
      providers: [
        AuthService,
        JwtStrategy,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockImplementation((_payload: any, options: any) =>
              options?.expiresIn === '7d' ? 'mock-refresh-token' : 'mock-access-token',
            ),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: any) => {
          const req = context.switchToHttp().getRequest();
          req.user = { id: 'test-user-id', phone: '13800001111' };
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

  describe('POST /api/v1/auth/register', () => {
    it('应参数不全时返回 400', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ phone: '13800001111' });
      expect(res.status).toBe(400);
    });

    it('应成功注册时返回 201', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'new-id', phone: '13800001111', username: 'user_a1b2c3',
      });
      mockPrisma.refreshToken.create.mockResolvedValue({});

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          phone: '13800001111',
          password: 'password123',
          confirmPassword: 'password123',
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('user');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('应用手机号登录返回 200', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-id', phone: '13800001111', passwordHash: 'hash', status: 'active',
      });
      mockPrisma.refreshToken.create.mockResolvedValue({});

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ account: '13800001111', password: 'password123' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
    });

    it('应用 username 登录返回 200', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-id', phone: '13800001111', passwordHash: 'hash', status: 'active',
      });
      mockPrisma.refreshToken.create.mockResolvedValue({});

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ account: 'user_a1b2c3', password: 'password123' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
    });
  });

  describe('POST /api/v1/auth/forgot-password', () => {
    it('应返回提示信息', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/forgot-password')
        .send({ phone: '13800001111' });

      expect(res.status).toBe(200);
    });
  });

  describe('POST /api/v1/auth/reset-password', () => {
    it('应成功重置密码', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'u', phone: '13800001111' });
      mockPrisma.user.update.mockResolvedValue({});

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/reset-password')
        .send({ phone: '13800001111', newPassword: 'new123456' });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('密码重置成功');
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('应返回当前用户信息', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'test-user-id', phone: '13800001111', username: 'user_a1b2c3',
        name: 'Test', email: null, avatarUrl: null,
      });

      const res = await request(app.getHttpServer()).get('/api/v1/auth/me');
      expect(res.status).toBe(200);
      expect(res.body.id).toBe('test-user-id');
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('应成功注销', async () => {
      mockPrisma.refreshToken.deleteMany.mockResolvedValue({ count: 1 });
      const res = await request(app.getHttpServer()).post('/api/v1/auth/logout');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
