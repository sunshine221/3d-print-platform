import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaClient, Prisma, StockStatus, SKUStatus } from '@prisma/client';
import { CreateSkuDto, UpdateSkuDto } from './dto/sku.dto';

const prisma = new PrismaClient();

function generateSkuCode(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const seq = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SKU-${date}-${seq}`;
}

@Injectable()
export class SkuService {
  private resolveSkuCode(existing?: string): string {
    if (existing) return existing;
    return generateSkuCode();
  }

  async findByProductId(productId: string) {
    const skus = await prisma.sKU.findMany({
      where: { productId },
      orderBy: { createdAt: 'asc' },
    });
    return skus.map((s) => ({ ...s, price: Number(s.price) }));
  }

  async findById(productId: string, skuId: string) {
    const sku = await prisma.sKU.findFirst({
      where: { id: skuId, productId },
    });
    if (!sku) throw new NotFoundException('SKU 不存在');
    return { ...sku, price: Number(sku.price) };
  }

  async create(productId: string, dto: CreateSkuDto) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('产品不存在');

    const skuCode = this.resolveSkuCode(dto.skuCode);
    const existing = await prisma.sKU.findUnique({ where: { skuCode } });
    if (existing) throw new ConflictException('SKU 编码已存在');

    const sku = await prisma.sKU.create({
      data: {
        productId,
        skuCode,
        specCombo: dto.specCombo as Prisma.JsonObject,
        price: new Prisma.Decimal(dto.price),
        minOrderQty: dto.minOrderQty || 1,
        stockStatus: (dto.stockStatus as StockStatus) || 'make_to_order',
        leadTimeDays: dto.leadTimeDays,
        imageUrl: dto.imageUrl,
        status: (dto.status as SKUStatus) || 'active',
      },
    });

    await this.syncProductMaterials(productId);

    return {
      ...sku,
      price: Number(sku.price),
    };
  }

  async update(productId: string, skuId: string, dto: UpdateSkuDto) {
    await this.findById(productId, skuId);

    if (dto.skuCode) {
      const existing = await prisma.sKU.findFirst({
        where: { skuCode: dto.skuCode, NOT: { id: skuId } },
      });
      if (existing) throw new ConflictException('SKU 编码已存在');
    }

    const data: any = { ...dto };
    delete data.specCombo;
    if (dto.price !== undefined) data.price = new Prisma.Decimal(dto.price);
    if (dto.specCombo) data.specCombo = dto.specCombo as Prisma.JsonObject;
    if (dto.stockStatus) data.stockStatus = dto.stockStatus as StockStatus;
    if (dto.status) data.status = dto.status as SKUStatus;

    const sku = await prisma.sKU.update({ where: { id: skuId }, data });
    await this.syncProductMaterials(productId);

    return {
      ...sku,
      price: Number(sku.price),
    };
  }

  async delete(productId: string, skuId: string) {
    await this.findById(productId, skuId);
    await prisma.sKU.delete({ where: { id: skuId } });
    await this.syncProductMaterials(productId);
    return { success: true };
  }

  private async syncProductMaterials(productId: string) {
    const skus = await prisma.sKU.findMany({
      where: { productId, status: 'active' },
      select: { specCombo: true },
    });

    const materials = new Set<string>();
    const techniques = new Set<string>();

    for (const sku of skus) {
      const combo = sku.specCombo as Record<string, string>;
      if (combo['材质']) materials.add(combo['材质']);
      if (combo['工艺']) techniques.add(combo['工艺']);
      if (combo['颜色']) materials.add(combo['颜色']); // 颜色也放 materials 用于筛选
    }

    await prisma.product.update({
      where: { id: productId },
      data: {
        materials: Array.from(materials),
        techniques: Array.from(techniques),
      },
    });
  }
}
