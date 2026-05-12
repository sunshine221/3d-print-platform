import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class BannerService {
  async findActive() {
    return prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findAll(query: { page: number; pageSize: number }) {
    const [items, total] = await Promise.all([
      prisma.banner.findMany({
        orderBy: { sortOrder: 'asc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      prisma.banner.count(),
    ]);
    return {
      items,
      pagination: { page: query.page, pageSize: query.pageSize, total, totalPages: Math.ceil(total / query.pageSize) },
    };
  }

  async findById(id: string) {
    const banner = await prisma.banner.findUnique({ where: { id } });
    if (!banner) throw new NotFoundException('Banner 不存在');
    return banner;
  }

  async create(dto: { title?: string; subtitle?: string; imageUrl: string; linkUrl?: string; sortOrder?: number; isActive?: boolean }) {
    return prisma.banner.create({ data: dto as any });
  }

  async update(id: string, dto: { title?: string; subtitle?: string; imageUrl?: string; linkUrl?: string; sortOrder?: number; isActive?: boolean }) {
    await this.findById(id);
    return prisma.banner.update({ where: { id }, data: dto as any });
  }

  async delete(id: string) {
    await this.findById(id);
    await prisma.banner.delete({ where: { id } });
    return { success: true };
  }
}
