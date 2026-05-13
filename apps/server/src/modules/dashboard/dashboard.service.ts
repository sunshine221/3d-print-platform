import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class DashboardService {
  async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [todayPageViews, monthOrders, monthInquiries, activeProducts, completedOrders] =
      await Promise.all([
        prisma.pageView.count({ where: { createdAt: { gte: today } } }),
        prisma.order.count({ where: { createdAt: { gte: thisMonth } } }),
        prisma.printServiceInquiry.count({ where: { createdAt: { gte: thisMonth } } }),
        prisma.product.count({ where: { status: 'published' } }),
        prisma.order.count({
          where: { createdAt: { gte: thisMonth }, status: 'completed' },
        }),
      ]);

    return {
      todayPageViews,
      monthOrders,
      monthInquiries,
      activeProducts,
      conversionRate: monthOrders > 0 ? Math.round((completedOrders / monthOrders) * 100) : 0,
    };
  }

  async getRecentOrders() {
    return prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { user: { select: { phone: true, name: true } } },
    });
  }

  async getRecentInquiries() {
    return prisma.printServiceInquiry.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { user: { select: { phone: true, name: true } } },
    });
  }
}
