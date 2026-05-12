import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import {
  CreateInquiryDto,
  QuoteDto,
  UpdateInquiryStatusDto,
  SendMessageDto,
} from './dto/inquiry.dto';

const prisma = new PrismaClient();

type AnyRecord = Record<string, unknown>;

function generateInquiryNo(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `INQ${ts}${rand}`;
}

@Injectable()
export class InquiryService {
  async create(userId: string, dto: CreateInquiryDto) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    const inquiry = await prisma.printServiceInquiry.create({
      data: {
        inquiryNo: generateInquiryNo(),
        userId,
        productId: dto.productId || null,
        desiredMaterial: dto.desiredMaterial,
        desiredColor: dto.desiredColor,
        desiredQuantity: dto.desiredQuantity,
        desiredSize: dto.desiredSize,
        desiredDeadline: dto.desiredDeadline ? new Date(dto.desiredDeadline) : null,
        additionalNotes: dto.additionalNotes,
        contactName: dto.contactName || user?.defaultContactName,
        contactPhone: dto.contactPhone || user?.defaultContactPhone,
        logs: {
          create: {
            action: '提交询价',
            toStatus: 'pending_review',
            operatorType: 'customer',
            operatorId: userId,
            detail: '用户提交代打询价',
          },
        },
      },
      include: {
        files: true,
        messages: true,
        logs: true,
        product: { select: { id: true, name: true } },
      },
    });

    return this.mapInquiry(inquiry);
  }

  async findByUser(userId: string, query: { page: number; pageSize: number }) {
    const where = { userId };

    const [items, total] = await Promise.all([
      prisma.printServiceInquiry.findMany({
        where: where as any,
        include: {
          product: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      prisma.printServiceInquiry.count({ where: where as any }),
    ]);

    return {
      items: items.map((i: any) => ({
        id: i.id,
        inquiryNo: i.inquiryNo,
        productName: i.product?.name || null,
        desiredMaterial: i.desiredMaterial,
        desiredColor: i.desiredColor,
        desiredQuantity: i.desiredQuantity,
        status: i.status,
        adminQuoteTotalPrice: i.adminQuoteTotalPrice ? Number(i.adminQuoteTotalPrice) : null,
        createdAt: i.createdAt.toISOString(),
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
    const inquiry: any = await prisma.printServiceInquiry.findUnique({
      where: { id },
      include: {
        files: true,
        messages: { orderBy: { createdAt: 'asc' } },
        logs: { orderBy: { createdAt: 'asc' } },
        product: { select: { id: true, name: true } },
      },
    });

    if (!inquiry) throw new NotFoundException('询价不存在');

    return this.mapInquiry(inquiry);
  }

  async findByIdAndUser(id: string, userId: string) {
    const inquiry: any = await prisma.printServiceInquiry.findFirst({
      where: { id, userId },
      include: {
        files: true,
        messages: { orderBy: { createdAt: 'asc' } },
        logs: { orderBy: { createdAt: 'asc' } },
        product: { select: { id: true, name: true } },
      },
    });

    if (!inquiry) throw new NotFoundException('询价不存在');

    return this.mapInquiry(inquiry);
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
      where.inquiryNo = { contains: query.search, mode: 'insensitive' };
    }

    const [items, total] = await Promise.all([
      prisma.printServiceInquiry.findMany({
        where: where as any,
        include: {
          product: { select: { id: true, name: true } },
          user: { select: { id: true, email: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      prisma.printServiceInquiry.count({ where: where as any }),
    ]);

    return {
      items: items.map((i: any) => ({
        id: i.id,
        inquiryNo: i.inquiryNo,
        productName: i.product?.name || null,
        desiredMaterial: i.desiredMaterial,
        desiredColor: i.desiredColor,
        desiredQuantity: i.desiredQuantity,
        status: i.status,
        user: i.user,
        adminQuoteTotalPrice: i.adminQuoteTotalPrice ? Number(i.adminQuoteTotalPrice) : null,
        createdAt: i.createdAt.toISOString(),
      })),
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.ceil(total / query.pageSize),
      },
    };
  }

  async quote(id: string, dto: QuoteDto, adminId: string) {
    const inquiry = await prisma.printServiceInquiry.findUnique({ where: { id } });
    if (!inquiry) throw new NotFoundException('询价不存在');

    const totalPrice = dto.adminQuoteUnitPrice * dto.adminQuoteQuantity;

    await prisma.printServiceInquiry.update({
      where: { id },
      data: {
        adminQuoteUnitPrice: dto.adminQuoteUnitPrice,
        adminQuoteQuantity: dto.adminQuoteQuantity,
        adminQuoteTotalPrice: totalPrice,
        adminQuoteNote: dto.adminQuoteNote,
        adminQuoteDeliveryDays: dto.adminQuoteDeliveryDays,
        adminQuoteAt: new Date(),
        status: inquiry.status === 'pending_review' ? 'quoted' as any : undefined,
        logs: {
          create: {
            action: '管理员报价',
            fromStatus: inquiry.status,
            toStatus: inquiry.status === 'pending_review' ? 'quoted' : inquiry.status,
            operatorType: 'admin',
            operatorId: adminId,
            detail: `报价: ¥${totalPrice} (${dto.adminQuoteUnitPrice} × ${dto.adminQuoteQuantity})`,
          },
        },
      },
    });

    return this.findById(id);
  }

  async updateStatus(id: string, dto: UpdateInquiryStatusDto, operator: { type: string; id: string }) {
    const inquiry = await prisma.printServiceInquiry.findUnique({ where: { id } });
    if (!inquiry) throw new NotFoundException('询价不存在');

    await prisma.printServiceInquiry.update({
      where: { id },
      data: {
        status: dto.status as any,
        logs: {
          create: {
            action: '状态变更',
            fromStatus: inquiry.status,
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

  async sendMessage(id: string, userId: string, dto: SendMessageDto) {
    const inquiry = await prisma.printServiceInquiry.findFirst({
      where: { id, userId },
    });
    if (!inquiry) throw new NotFoundException('询价不存在');

    await prisma.inquiryMessage.create({
      data: {
        inquiryId: id,
        senderType: 'customer',
        senderId: userId,
        content: dto.content,
      },
    });

    return this.findByIdAndUser(id, userId);
  }

  async adminSendMessage(id: string, adminId: string, dto: SendMessageDto) {
    const inquiry = await prisma.printServiceInquiry.findUnique({ where: { id } });
    if (!inquiry) throw new NotFoundException('询价不存在');

    await prisma.inquiryMessage.create({
      data: {
        inquiryId: id,
        senderType: 'admin',
        senderId: adminId,
        content: dto.content,
      },
    });

    return this.findById(id);
  }

  private mapInquiry(i: any) {
    return {
      id: i.id,
      inquiryNo: i.inquiryNo,
      productId: i.productId,
      productName: i.product?.name || null,
      desiredMaterial: i.desiredMaterial,
      desiredColor: i.desiredColor,
      desiredQuantity: i.desiredQuantity,
      desiredSize: i.desiredSize,
      desiredDeadline: i.desiredDeadline instanceof Date ? i.desiredDeadline.toISOString() : i.desiredDeadline,
      additionalNotes: i.additionalNotes,
      contactName: i.contactName,
      contactPhone: i.contactPhone,
      status: i.status,
      adminQuoteUnitPrice: i.adminQuoteUnitPrice ? Number(i.adminQuoteUnitPrice) : null,
      adminQuoteQuantity: i.adminQuoteQuantity,
      adminQuoteTotalPrice: i.adminQuoteTotalPrice ? Number(i.adminQuoteTotalPrice) : null,
      adminQuoteNote: i.adminQuoteNote,
      adminQuoteDeliveryDays: i.adminQuoteDeliveryDays,
      adminQuoteAt: i.adminQuoteAt instanceof Date ? i.adminQuoteAt.toISOString() : i.adminQuoteAt,
      createdAt: i.createdAt instanceof Date ? i.createdAt.toISOString() : i.createdAt,
      updatedAt: i.updatedAt instanceof Date ? i.updatedAt.toISOString() : i.updatedAt,
      files: (i.files || []).map((f: any) => ({
        id: f.id,
        fileUrl: f.fileUrl,
        fileName: f.fileName,
        fileSize: f.fileSize ? Number(f.fileSize) : null,
        fileType: f.fileType,
      })),
      messages: (i.messages || []).map((m: any) => ({
        id: m.id,
        senderType: m.senderType,
        content: m.content,
        createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : m.createdAt,
      })),
      logs: (i.logs || []).map((l: any) => ({
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
