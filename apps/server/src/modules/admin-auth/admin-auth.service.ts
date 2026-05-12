import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { AdminLoginDto, AdminChangePasswordDto } from './dto/admin-auth.dto';
import { TokenPair } from '@3d-print/types';

const prisma = new PrismaClient();

@Injectable()
export class AdminAuthService {
  constructor(private jwtService: JwtService) {}

  private generateTokenPair(payload: { sub: string; email: string; roleId: string }): TokenPair {
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ADMIN_SECRET || 'dev-admin-secret',
      expiresIn: '15m',
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ADMIN_SECRET || 'dev-admin-secret',
      expiresIn: '7d',
    });
    return { accessToken, refreshToken, expiresIn: 900 };
  }

  async login(dto: AdminLoginDto) {
    const user = await prisma.adminUser.findUnique({
      where: { email: dto.email },
      include: { role: true },
    });
    if (!user) throw new UnauthorizedException('邮箱或密码错误');
    if (user.status === 'disabled') throw new UnauthorizedException('账号已被禁用');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('邮箱或密码错误');

    const tokens = this.generateTokenPair({ sub: user.id, email: user.email, roleId: user.roleId });

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({
      data: { adminUserId: user.id, token: tokens.refreshToken, expiresAt },
    });

    await prisma.adminUser.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      ...tokens,
      user: { id: user.id, email: user.email, name: user.name, role: user.role.slug },
    };
  }

  async refresh(refreshToken: string) {
    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('令牌无效或已过期');
    }

    await prisma.refreshToken.delete({ where: { id: stored.id } });

    const user = await prisma.adminUser.findUnique({
      where: { id: stored.adminUserId! },
      include: { role: true },
    });
    if (!user || user.status === 'disabled') {
      throw new UnauthorizedException('用户不可用');
    }

    const tokens = this.generateTokenPair({ sub: user.id, email: user.email, roleId: user.roleId });

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({
      data: { adminUserId: user.id, token: tokens.refreshToken, expiresAt },
    });

    return {
      ...tokens,
      user: { id: user.id, email: user.email, name: user.name, role: user.role.slug },
    };
  }

  async logout(adminUserId: string) {
    await prisma.refreshToken.deleteMany({ where: { adminUserId } });
    return { success: true };
  }

  async getMe(adminUserId: string) {
    const user = await prisma.adminUser.findUnique({
      where: { id: adminUserId },
      include: { role: true },
    });
    if (!user) throw new UnauthorizedException();
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      role: user.role.slug,
      permissions: (typeof user.role.permissions === 'string'
        ? JSON.parse(user.role.permissions as string)
        : user.role.permissions) as string[],
    };
  }

  async changePassword(adminUserId: string, dto: AdminChangePasswordDto) {
    const user = await prisma.adminUser.findUnique({ where: { id: adminUserId } });
    if (!user) throw new UnauthorizedException();

    const valid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!valid) throw new BadRequestException('当前密码错误');

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await prisma.adminUser.update({ where: { id: adminUserId }, data: { passwordHash } });

    return { message: '密码修改成功' };
  }
}
