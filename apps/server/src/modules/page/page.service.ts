import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class PageService {
  async findBySlug(slug: string) {
    const page = await prisma.page.findUnique({
      where: { slug },
      select: { id: true, title: true, slug: true, content: true, metaTitle: true, metaDescription: true },
    });
    if (!page) throw new NotFoundException('页面不存在');
    return page;
  }

  async findAll(query: { page: number; pageSize: number }) {
    const [items, total] = await Promise.all([
      prisma.page.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      prisma.page.count(),
    ]);
    return {
      items,
      pagination: { page: query.page, pageSize: query.pageSize, total, totalPages: Math.ceil(total / query.pageSize) },
    };
  }

  async findById(id: string) {
    const page = await prisma.page.findUnique({ where: { id } });
    if (!page) throw new NotFoundException('页面不存在');
    return page;
  }

  async update(id: string, dto: { title?: string; content?: string; metaTitle?: string; metaDescription?: string }) {
    await this.findById(id);
    return prisma.page.update({ where: { id }, data: dto as any });
  }
}
