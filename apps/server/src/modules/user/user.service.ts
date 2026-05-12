import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class UserService {
  async findAll(query: { page: number; pageSize: number; search?: string }) {
    const where: any = {};
    if (query.search) {
      where.OR = [
        { email: { contains: query.search } },
        { name: { contains: query.search } },
        { phone: { contains: query.search } },
      ];
    }
    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          status: true,
          createdAt: true,
          _count: { select: { orders: true, inquiries: true } },
        },
      }),
      prisma.user.count({ where }),
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
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatarUrl: true,
        defaultContactName: true,
        defaultContactPhone: true,
        defaultAddress: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { orders: true, inquiries: true } },
      },
    });
    if (!user) throw new NotFoundException('用户不存在');
    return user;
  }

  async toggleStatus(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('用户不存在');
    const newStatus = user.status === 'active' ? 'disabled' : 'active';
    return prisma.user.update({
      where: { id },
      data: { status: newStatus },
      select: { id: true, email: true, name: true, status: true },
    });
  }
}
