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
  ResetPasswordDto,
  ChangePasswordDto,
} from './dto/auth.dto';
import { TokenPair } from '@3d-print/types';

const prisma = new PrismaClient();

function generateUsername(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'user_';
  for (let i = 0; i < 6; i++) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  private generateTokenPair(payload: { sub: string; phone: string }): TokenPair {
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
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('两次密码不一致');
    }

    const existingPhone = await prisma.user.findUnique({ where: { phone: dto.phone } });
    if (existingPhone) throw new ConflictException('该手机号已注册');

    const passwordHash = await bcrypt.hash(dto.password, 10);

    let username = generateUsername();
    while (await prisma.user.findUnique({ where: { username } })) {
      username = generateUsername();
    }

    const user = await prisma.user.create({
      data: {
        phone: dto.phone,
        username,
        passwordHash,
        name: dto.name || `用户${dto.phone.slice(-4)}`,
      },
    });

    const tokens = this.generateTokenPair({ sub: user.id, phone: user.phone });
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({
      data: { userId: user.id, token: tokens.refreshToken, expiresAt },
    });

    return {
      ...tokens,
      user: {
        id: user.id,
        username: user.username,
        phone: user.phone.slice(0, 3) + '****' + user.phone.slice(-4),
      },
    };
  }

  async login(dto: LoginDto) {
    const isPhone = /^1[3-9]\d{9}$/.test(dto.account);
    const user = isPhone
      ? await prisma.user.findUnique({ where: { phone: dto.account } })
      : await prisma.user.findUnique({ where: { username: dto.account } });

    if (!user) throw new UnauthorizedException('手机号/账号或密码错误');
    if (user.status === 'disabled') throw new UnauthorizedException('账号已被禁用');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('手机号/账号或密码错误');

    const tokens = this.generateTokenPair({ sub: user.id, phone: user.phone });

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

    await prisma.refreshToken.delete({ where: { id: stored.id } });

    const user = await prisma.user.findUnique({ where: { id: stored.userId! } });
    if (!user || user.status === 'disabled') {
      throw new UnauthorizedException('用户不可用');
    }

    const tokens = this.generateTokenPair({ sub: user.id, phone: user.phone });

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({
      data: { userId: user.id, token: tokens.refreshToken, expiresAt },
    });

    return tokens;
  }

  async logout(userId: string) {
    await prisma.refreshToken.deleteMany({ where: { userId } });
    return { success: true };
  }

  async forgotPassword(phone: string) {
    return { message: '如该手机号已注册，可直接重置密码' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await prisma.user.findUnique({ where: { phone: dto.phone } });
    if (!user) return { message: '密码重置成功' };

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await prisma.user.update({
      where: { phone: dto.phone },
      data: { passwordHash },
    });

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
      username: user.username,
      phone: user.phone,
      name: user.name,
      avatarUrl: user.avatarUrl,
    };
  }
}
