import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaClient, Prisma, ProductType, ProductStatus } from '@prisma/client';
import { CreateProductDto, UpdateProductDto, BatchOperationDto } from './dto/product.dto';

const prisma = new PrismaClient();

// Prisma 复杂 select 类型推断有限，使用 any 辅助类型
type AnyRecord = Record<string, unknown>;

function sanitizeModel3d(m: any) {
  if (!m) return m;
  return { ...m, fileSize: m.fileSize ? Number(m.fileSize) : null };
}

@Injectable()
export class ProductService {
  // ===== 公开接口 =====

  async findPublished(query: {
    page: number;
    pageSize: number;
    category?: string;
    material?: string;
    technique?: string;
    minPrice?: number;
    maxPrice?: number;
    color?: string;
    tolerance?: string;
    search?: string;
    sort?: string;
  }) {
    const where: AnyRecord = { status: 'published' };

    if (query.category) {
      where.categories = { some: { category: { slug: query.category } } };
    }
    if (query.material) {
      where.materials = { has: query.material };
    }
    if (query.technique) {
      where.techniques = { has: query.technique };
    }
    if (query.tolerance) {
      where.tolerance = { contains: query.tolerance };
    }
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    let orderBy: AnyRecord = { createdAt: 'desc' };
    if (query.sort === 'popular') {
      orderBy = { viewCount: 'desc' };
    } else if (query.sort === 'newest') {
      orderBy = { createdAt: 'desc' };
    } else {
      orderBy = { createdAt: 'desc' };
    }

    const select = {
      id: true,
      name: true,
      slug: true,
      subtitle: true,
      thumbnailUrl: true,
      productType: true,
      materials: true,
      techniques: true,
      status: true,
      viewCount: true,
      createdAt: true,
      categories: {
        select: {
          category: { select: { id: true, name: true, slug: true } },
        },
      },
      skus: {
        where: { status: 'active' },
        select: { price: true },
        orderBy: { price: 'asc' as const },
      },
    };

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where: where as any,
        select: select as any,
        orderBy: orderBy as any,
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      prisma.product.count({ where: where as any }),
    ]);

    const mapped = items.map((item: any) => {
      const { categories, skus, ...rest } = item;
      const prices = skus.map((s: any) => Number(s.price));
      return {
        ...rest,
        categories: categories.map((c: any) => c.category),
        minPrice: prices.length > 0 ? Math.min(...prices) : null,
        maxPrice: prices.length > 0 ? Math.max(...prices) : null,
      };
    });

    if (query.sort === 'price_asc') {
      mapped.sort((a: any, b: any) => (a.minPrice ?? 0) - (b.minPrice ?? 0));
    } else if (query.sort === 'price_desc') {
      mapped.sort((a: any, b: any) => (b.minPrice ?? 0) - (a.minPrice ?? 0));
    }

    return {
      items: mapped,
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.ceil(total / query.pageSize),
      },
    };
  }

  async findBySlug(slug: string) {
    const product: any = await prisma.product.findUnique({
      where: { slug },
      include: {
        categories: { select: { category: true } },
        skus: true,
        images: { orderBy: { sortOrder: 'asc' as const } },
        model3d: true,
      },
    });
    if (!product || product.status === 'draft') {
      throw new NotFoundException('产品不存在');
    }

    await prisma.product.update({
      where: { id: product.id },
      data: { viewCount: { increment: 1 } },
    });

    const { categories, skus, images, model3d, specs, ...rest } = product;

    return {
      ...rest,
      specs: specs as Array<{ name: string; value: string }>,
      categories: categories.map((c: any) => c.category),
      images,
      model3d: sanitizeModel3d(model3d),
      skus: skus.map((s: any) => ({ ...s, price: Number(s.price) })),
    };
  }

  async findRelated(slug: string) {
    const product: any = await prisma.product.findUnique({
      where: { slug },
      select: { id: true, categories: { select: { categoryId: true } } },
    });
    if (!product) throw new NotFoundException('产品不存在');

    const categoryIds = product.categories.map((c: any) => c.categoryId);
    const select = {
      id: true,
      name: true,
      slug: true,
      subtitle: true,
      thumbnailUrl: true,
      productType: true,
      materials: true,
      techniques: true,
      status: true,
      viewCount: true,
      createdAt: true,
      categories: {
        select: {
          category: { select: { id: true, name: true, slug: true } },
        },
      },
      skus: {
        where: { status: 'active' },
        select: { price: true },
      },
    };

    const related: any[] = await prisma.product.findMany({
      where: {
        status: 'published',
        id: { not: product.id },
        categories: { some: { categoryId: { in: categoryIds } } },
      },
      select: select as any,
      take: 6,
    });

    return related.map((item: any) => {
      const { categories, skus, ...rest } = item;
      const prices = skus.map((s: any) => Number(s.price));
      return {
        ...rest,
        categories: categories.map((c: any) => c.category),
        minPrice: prices.length > 0 ? Math.min(...prices) : null,
      };
    });
  }

  // ===== 管理接口 =====

  async findAll(query: {
    page: number;
    pageSize: number;
    category?: string;
    material?: string;
    technique?: string;
    search?: string;
    status?: string;
    sort?: string;
  }) {
    const where: AnyRecord = {};

    if (query.status) where.status = query.status;
    if (query.category) {
      where.categories = { some: { category: { slug: query.category } } };
    }
    if (query.material) where.materials = { has: query.material };
    if (query.technique) where.techniques = { has: query.technique };
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { slug: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const select = {
      id: true,
      name: true,
      slug: true,
      subtitle: true,
      thumbnailUrl: true,
      productType: true,
      materials: true,
      techniques: true,
      status: true,
      viewCount: true,
      createdAt: true,
      categories: {
        select: {
          category: { select: { id: true, name: true, slug: true } },
        },
      },
      skus: {
        where: { status: 'active' },
        select: { price: true },
        orderBy: { price: 'asc' as const },
      },
    };

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where: where as any,
        select: select as any,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      prisma.product.count({ where: where as any }),
    ]);

    const mapped = items.map((item: any) => {
      const { categories, skus, ...rest } = item;
      const prices = skus.map((s: any) => Number(s.price));
      return {
        ...rest,
        categories: categories.map((c: any) => c.category),
        minPrice: prices.length > 0 ? Math.min(...prices) : null,
        maxPrice: prices.length > 0 ? Math.max(...prices) : null,
        skuCount: skus.length,
      };
    });

    return {
      items: mapped,
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.ceil(total / query.pageSize),
      },
    };
  }

  async findById(id: string) {
    const product: any = await prisma.product.findUnique({
      where: { id },
      include: {
        categories: { select: { category: true } },
        skus: true,
        images: { orderBy: { sortOrder: 'asc' as const } },
        model3d: true,
      },
    });
    if (!product) throw new NotFoundException('产品不存在');

    const { categories, skus, images, model3d, specs, ...rest } = product;

    return {
      ...rest,
      specs: specs as Array<{ name: string; value: string }>,
      categories: categories.map((c: any) => c.category),
      images,
      model3d: sanitizeModel3d(model3d),
      skus: skus.map((s: any) => ({ ...s, price: Number(s.price) })),
    };
  }

  async create(dto: CreateProductDto) {
    const existing = await prisma.product.findUnique({ where: { slug: dto.slug } });
    if (existing) throw new ConflictException('产品 slug 已存在');

    const { categoryIds, specs, productType, ...productData } = dto;

    const product = await prisma.product.create({
      data: {
        ...productData,
        productType: productType as ProductType,
        specs: (specs || []) as unknown as Prisma.JsonArray,
        categories: categoryIds?.length
          ? { create: categoryIds.map((cid: string) => ({ categoryId: cid })) }
          : undefined,
      } as any,
    });

    return this.findById(product.id);
  }

  async update(id: string, dto: UpdateProductDto) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('产品不存在');

    if (dto.slug && dto.slug !== product.slug) {
      const dup = await prisma.product.findUnique({ where: { slug: dto.slug } });
      if (dup) throw new ConflictException('产品 slug 已存在');
    }

    const { categoryIds, specs, productType, ...productData } = dto;

    const data: AnyRecord = { ...productData };
    if (productType) data.productType = productType as ProductType;
    if (specs) data.specs = specs as unknown as Prisma.JsonArray;

    if (categoryIds !== undefined) {
      await prisma.productCategory.deleteMany({ where: { productId: id } });
      if (categoryIds.length > 0) {
        await prisma.productCategory.createMany({
          data: categoryIds.map((cid: string) => ({ productId: id, categoryId: cid })),
        });
      }
    }

    await prisma.product.update({ where: { id }, data: data as any });
    return this.findById(id);
  }

  async delete(id: string) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('产品不存在');
    await prisma.product.delete({ where: { id } });
    return { success: true };
  }

  async batchOperation(dto: BatchOperationDto) {
    const data: AnyRecord = {};
    if (dto.status) data.status = dto.status as ProductStatus;

    const ops = dto.ids.map((id) =>
      prisma.product.update({ where: { id }, data: data as any }),
    );

    if (dto.categoryIds) {
      for (const id of dto.ids) {
        await prisma.productCategory.deleteMany({ where: { productId: id } });
        if (dto.categoryIds.length > 0) {
          await prisma.productCategory.createMany({
            data: dto.categoryIds.map((cid: string) => ({ productId: id, categoryId: cid })),
          });
        }
      }
    }

    await prisma.$transaction(ops);
    return { success: true };
  }

  // ===== 图片管理 =====

  async addImage(
    productId: string,
    data: { url: string; altText?: string; isPrimary?: boolean },
  ) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('产品不存在');

    if (data.isPrimary) {
      await prisma.productImage.updateMany({
        where: { productId },
        data: { isPrimary: false },
      });
    }

    const maxSort = await prisma.productImage.aggregate({
      where: { productId },
      _max: { sortOrder: true },
    });

    return prisma.productImage.create({
      data: {
        productId,
        url: data.url,
        altText: data.altText,
        sortOrder: (maxSort._max.sortOrder ?? -1) + 1,
        isPrimary: data.isPrimary || false,
      },
    });
  }

  async updateImageSort(productId: string, imageId: string, sortOrder: number) {
    return prisma.productImage.updateMany({
      where: { id: imageId, productId },
      data: { sortOrder },
    });
  }

  async setPrimaryImage(productId: string, imageId: string) {
    await prisma.productImage.updateMany({
      where: { productId },
      data: { isPrimary: false },
    });
    return prisma.productImage.update({
      where: { id: imageId },
      data: { isPrimary: true },
    });
  }

  async deleteImage(productId: string, imageId: string) {
    await prisma.productImage.deleteMany({
      where: { id: imageId, productId },
    });
    return { success: true };
  }

  // ===== 3D 模型 =====

  async upsertModel3D(
    productId: string,
    data: { fileUrl: string; fileName?: string; fileSize?: number; thumbnailUrl?: string },
  ) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('产品不存在');

    return sanitizeModel3d(
      await prisma.model3D.upsert({
        where: { productId },
        create: { productId, ...data },
        update: data,
      }),
    );
  }
}
