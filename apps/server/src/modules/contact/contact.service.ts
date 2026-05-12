import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class ContactService {
  async create(dto: { name: string; email: string; message: string }) {
    return prisma.contactMessage.create({ data: dto });
  }

  async findAll(query: { page: number; pageSize: number }) {
    const [items, total] = await Promise.all([
      prisma.contactMessage.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      prisma.contactMessage.count(),
    ]);
    return {
      items,
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.ceil(total / query.pageSize),
      },
    };
  }

  async findById(id: string) {
    const msg = await prisma.contactMessage.findUnique({ where: { id } });
    if (!msg) throw new NotFoundException('消息不存在');
    return msg;
  }

  async markRead(id: string) {
    await this.findById(id);
    return prisma.contactMessage.update({ where: { id }, data: { isRead: true } });
  }

  async reply(id: string, reply: string) {
    await this.findById(id);
    return prisma.contactMessage.update({
      where: { id },
      data: { reply, isRead: true },
    });
  }
}
