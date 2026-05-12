import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { JwtAdminGuard } from '../../common/guards/jwt-admin.guard';

const prisma = new PrismaClient();

@Controller('admin/logs')
@UseGuards(JwtAdminGuard)
export class LogController {
  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('action') action?: string,
  ) {
    const where: any = {};
    if (action) where.action = action;

    const [items, total] = await Promise.all([
      prisma.operationLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: ((page || 1) - 1) * (pageSize || 20),
        take: pageSize || 20,
        include: { adminUser: { select: { email: true, name: true } } },
      }),
      prisma.operationLog.count({ where }),
    ]);
    return {
      items,
      pagination: {
        page: page || 1,
        pageSize: pageSize || 20,
        total,
        totalPages: Math.ceil(total / (pageSize || 20)),
      },
    };
  }
}
