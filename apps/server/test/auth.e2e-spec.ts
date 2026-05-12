import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

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
          req.user = { id: 'test-user-id', email: 'test@test.com' };
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
        .send({ email: 'test@test.com' });
      expect(res.status).toBe(400);
    });

    it('应成功注册时返回 201', async () => {
      mockPrisma.verificationCode.findFirst.mockResolvedValue({
        id: 'code-id', email: 'test@test.com', code: '1234', type: 'register',
        used: false, expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      });
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({ id: 'new-id', email: 'test@test.com' });
      mockPrisma.verificationCode.update.mockResolvedValue({});

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ email: 'test@test.com', password: 'password123', code: '1234' });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('accessToken');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('应成功登录时返回 200', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-id', email: 'test@test.com', passwordHash: 'hash', status: 'active',
      });
      mockPrisma.refreshToken.create.mockResolvedValue({});

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'test@test.com', password: 'password123' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
    });
  });

  describe('POST /api/v1/auth/send-code', () => {
    it('应成功发送验证码', async () => {
      mockPrisma.verificationCode.create.mockResolvedValue({});
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/send-code')
        .send({ email: 'test@test.com' });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('验证码已发送');
    });
  });

  describe('POST /api/v1/auth/forgot-password', () => {
    it('应防止账号枚举（未注册也返回成功）', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'no@test.com' });

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('如该邮箱已注册');
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('应返回当前用户信息', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'test-user-id', email: 'test@test.com', name: 'Test', phone: null, avatarUrl: null,
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
