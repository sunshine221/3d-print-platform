import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

import {
  RegisterDto,
  LoginDto,
  SendCodeDto,
  ResetPasswordDto,
  ChangePasswordDto,
} from './dto/auth.dto';
import { TokenPair } from '@3d-print/types';

const prisma = new PrismaClient();

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  private generateTokenPair(payload: { sub: string; email: string }): TokenPair {
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_USER_SECRET || 'dev-user-secret',
      expiresIn: '15m',
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_USER_SECRET || 'dev-user-secret',
      expiresIn: '7d',
    });
    return { accessToken, refreshToken, expiresIn: 900 };
  }

  async register(dto: RegisterDto) {
    // 验证码检查
    const code = await prisma.verificationCode.findFirst({
      where: { email: dto.email, code: dto.code, type: 'register', used: false },
      orderBy: { createdAt: 'desc' },
    });
    if (!code || code.expiresAt < new Date()) {
      throw new BadRequestException('验证码无效或已过期');
    }

    // 检查是否已注册
    const existing = await prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('该邮箱已被注册');

    // 创建用户
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await prisma.user.create({
      data: { email: dto.email, passwordHash, name: dto.name },
    });

    // 标记验证码已用
    await prisma.verificationCode.update({ where: { id: code.id }, data: { used: true } });

    // 签发 Token
    return this.generateTokenPair({ sub: user.id, email: user.email });
  }

  async login(dto: LoginDto) {
    const user = await prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('邮箱或密码错误');
    if (user.status === 'disabled') throw new UnauthorizedException('账号已被禁用');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('邮箱或密码错误');

    const tokens = this.generateTokenPair({ sub: user.id, email: user.email });

    // 存储 Refresh Token
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({
      data: { userId: user.id, token: tokens.refreshToken, expiresAt },
    });

    return tokens;
  }

  async refresh(refreshToken: string) {
    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('令牌无效或已过期');
    }

    // 吊销旧 Token
    await prisma.refreshToken.delete({ where: { id: stored.id } });

    const user = await prisma.user.findUnique({ where: { id: stored.userId! } });
    if (!user || user.status === 'disabled') {
      throw new UnauthorizedException('用户不可用');
    }

    const tokens = this.generateTokenPair({ sub: user.id, email: user.email });

    // 存储新 Refresh Token
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({
      data: { userId: user.id, token: tokens.refreshToken, expiresAt },
    });

    return tokens;
  }

  async logout(userId: string) {
    // 删除所有 refresh token
    await prisma.refreshToken.deleteMany({ where: { userId } });
    return { success: true };
  }

  async sendCode(email: string) {
    const code = String(Math.floor(1000 + Math.random() * 9000));
    await prisma.verificationCode.create({
      data: {
        email,
        code,
        type: 'register',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    // TODO: 实际发送邮件（开发环境用 MailHog 查看 http://localhost:8025）
    console.log(`[Verification Code] ${email}: ${code}`);
    return { message: '验证码已发送' };
  }

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return { message: '如该邮箱已注册，重置邮件已发送' };

    const code = String(Math.floor(1000 + Math.random() * 9000));
    await prisma.verificationCode.create({
      data: {
        email,
        code,
        type: 'reset_password',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    console.log(`[Reset Password Code] ${email}: ${code}`);
    return { message: '如该邮箱已注册，重置邮件已发送' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const code = await prisma.verificationCode.findFirst({
      where: { email: dto.email, code: dto.code, type: 'reset_password', used: false },
      orderBy: { createdAt: 'desc' },
    });
    if (!code || code.expiresAt < new Date()) {
      throw new BadRequestException('验证码无效或已过期');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await prisma.user.update({
      where: { email: dto.email },
      data: { passwordHash },
    });

    await prisma.verificationCode.update({ where: { id: code.id }, data: { used: true } });
    return { message: '密码重置成功' };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();

    const valid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!valid) throw new BadRequestException('当前密码错误');

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

    return { message: '密码修改成功' };
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
    };
  }
}
