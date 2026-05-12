import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateOrderDto, UpdateOrderStatusDto, UpdateTrackingDto } from './dto/order.dto';

const prisma = new PrismaClient();

type AnyRecord = Record<string, unknown>;

function generateOrderNo(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD${ts}${rand}`;
}

@Injectable()
export class OrderService {
  async create(userId: string, dto: CreateOrderDto) {
    // 校验所有商品和 SKU，计算总金额
    const itemsData: Array<{
      productId: string;
      productName: string;
      skuId: string;
      skuCode: string;
      specCombo: Record<string, string>;
      unitPrice: number;
      quantity: number;
      subtotal: number;
    }> = [];

    let totalPrice = 0;

    for (const item of dto.items) {
      const sku = await prisma.sKU.findUnique({
        where: { id: item.skuId },
        include: { product: { select: { id: true, name: true, status: true } } },
      });

      if (!sku || sku.status !== 'active') {
        throw new BadRequestException(`SKU ${item.skuId} 不可用`);
      }

      if (sku.product.status !== 'published') {
        throw new BadRequestException(`产品 ${sku.product.name} 已下架`);
      }

      const unitPrice = Number(sku.price);
      const subtotal = unitPrice * item.quantity;

      itemsData.push({
        productId: sku.product.id,
        productName: sku.product.name,
        skuId: sku.id,
        skuCode: sku.skuCode,
        specCombo: sku.specCombo as Record<string, string>,
        unitPrice,
        quantity: item.quantity,
        subtotal,
      });

      totalPrice += subtotal;
    }

    const order = await prisma.order.create({
      data: {
        orderNo: generateOrderNo(),
        userId,
        totalPrice,
        note: dto.note,
        contactName: dto.contactName,
        contactPhone: dto.contactPhone,
        shippingAddress: dto.shippingAddress,
        couponCode: dto.couponCode,
        items: {
          create: itemsData.map((i) => ({
            productId: i.productId,
            productName: i.productName,
            skuId: i.skuId,
            skuCode: i.skuCode,
            specCombo: i.specCombo,
            unitPrice: i.unitPrice,
            quantity: i.quantity,
            subtotal: i.subtotal,
          })),
        },
        logs: {
          create: {
            action: '订单创建',
            toStatus: 'pending_confirmation',
            operatorType: 'customer',
            operatorId: userId,
            detail: '用户提交订单',
          },
        },
      },
      include: {
        items: true,
        logs: true,
      },
    });

    return this.mapOrder(order);
  }

  async findByUser(userId: string, query: { page: number; pageSize: number }) {
    const where = { userId };

    const [items, total] = await Promise.all([
      prisma.order.findMany({
        where: where as any,
        include: { items: true },
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      prisma.order.count({ where: where as any }),
    ]);

    return {
      items: items.map((o: any) => ({
        id: o.id,
        orderNo: o.orderNo,
        totalPrice: Number(o.totalPrice),
        status: o.status,
        contactName: o.contactName,
        itemCount: o.items.length,
        createdAt: o.createdAt.toISOString(),
      })),
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.ceil(total / query.pageSize),
      },
    };
  }

  async findById(id: string) {
    const order: any = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        logs: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!order) throw new NotFoundException('订单不存在');

    return this.mapOrder(order);
  }

  async findByIdAndUser(id: string, userId: string) {
    const order: any = await prisma.order.findFirst({
      where: { id, userId },
      include: {
        items: true,
        logs: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!order) throw new NotFoundException('订单不存在');

    return this.mapOrder(order);
  }

  async findAll(query: {
    page: number;
    pageSize: number;
    status?: string;
    search?: string;
  }) {
    const where: AnyRecord = {};

    if (query.status) where.status = query.status;
    if (query.search) {
      where.orderNo = { contains: query.search, mode: 'insensitive' };
    }

    const [items, total] = await Promise.all([
      prisma.order.findMany({
        where: where as any,
        include: {
          items: true,
          user: { select: { id: true, email: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      prisma.order.count({ where: where as any }),
    ]);

    return {
      items: items.map((o: any) => ({
        id: o.id,
        orderNo: o.orderNo,
        totalPrice: Number(o.totalPrice),
        discountAmount: Number(o.discountAmount),
        status: o.status,
        contactName: o.contactName,
        contactPhone: o.contactPhone,
        user: o.user,
        itemCount: o.items.length,
        createdAt: o.createdAt.toISOString(),
      })),
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.ceil(total / query.pageSize),
      },
    };
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto, operator: { type: string; id: string }) {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('订单不存在');

    const validTransitions: Record<string, string[]> = {
      pending_confirmation: ['in_production', 'cancelled'],
      in_production: ['shipped', 'cancelled'],
      shipped: ['completed'],
    };

    const allowed = validTransitions[order.status];
    if (!allowed || !allowed.includes(dto.status)) {
      throw new BadRequestException(`不允许从 ${order.status} 转换为 ${dto.status}`);
    }

    await prisma.order.update({
      where: { id },
      data: {
        status: dto.status as any,
        logs: {
          create: {
            action: '状态变更',
            fromStatus: order.status,
            toStatus: dto.status,
            operatorType: operator.type as any,
            operatorId: operator.id,
            detail: dto.detail,
          },
        },
      },
    });

    return this.findById(id);
  }

  async updateTracking(id: string, dto: UpdateTrackingDto) {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('订单不存在');

    const updated: any = await prisma.order.update({
      where: { id },
      data: {
        trackingNumber: dto.trackingNumber,
        trackingCompany: dto.trackingCompany || null,
        status: order.status === 'in_production' ? 'shipped' as any : undefined,
        logs: {
          create: {
            action: '更新物流',
            operatorType: 'admin',
            detail: `物流单号: ${dto.trackingNumber}${dto.trackingCompany ? ` (${dto.trackingCompany})` : ''}`,
          },
        },
      },
      include: {
        items: true,
        logs: { orderBy: { createdAt: 'asc' } },
      },
    });

    return this.mapOrder(updated);
  }

  private mapOrder(o: any) {
    return {
      id: o.id,
      orderNo: o.orderNo,
      totalPrice: Number(o.totalPrice),
      discountAmount: Number(o.discountAmount),
      couponCode: o.couponCode,
      note: o.note,
      status: o.status,
      contactName: o.contactName,
      contactPhone: o.contactPhone,
      shippingAddress: o.shippingAddress,
      trackingNumber: o.trackingNumber,
      trackingCompany: o.trackingCompany,
      sourceInquiryId: o.sourceInquiryId,
      createdAt: o.createdAt instanceof Date ? o.createdAt.toISOString() : o.createdAt,
      updatedAt: o.updatedAt instanceof Date ? o.updatedAt.toISOString() : o.updatedAt,
      items: (o.items || []).map((i: any) => ({
        id: i.id,
        productId: i.productId,
        productName: i.productName,
        skuId: i.skuId,
        skuCode: i.skuCode,
        specCombo: i.specCombo,
        unitPrice: Number(i.unitPrice),
        quantity: i.quantity,
        subtotal: Number(i.subtotal),
      })),
      logs: (o.logs || []).map((l: any) => ({
        id: l.id,
        action: l.action,
        fromStatus: l.fromStatus,
        toStatus: l.toStatus,
        operatorType: l.operatorType,
        detail: l.detail,
        createdAt: l.createdAt instanceof Date ? l.createdAt.toISOString() : l.createdAt,
      })),
    };
  }
}
