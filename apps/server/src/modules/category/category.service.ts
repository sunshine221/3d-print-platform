import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateCategoryDto, UpdateCategoryDto, SortCategoryDto } from './dto/category.dto';
import { CategoryNode } from '@3d-print/types';
import { MediaService } from '../media/media.service';

const prisma = new PrismaClient();

@Injectable()
export class CategoryService {
  constructor(private mediaService: MediaService) {}
  async getTree(): Promise<CategoryNode[]> {
    const all = await prisma.category.findMany({
      where: { isVisible: true },
      orderBy: { sortOrder: 'desc' },
    });
    return this.buildTree(all);
  }

  async getAdminTree(): Promise<CategoryNode[]> {
    const all = await prisma.category.findMany({
      orderBy: { sortOrder: 'desc' },
    });
    return this.buildTree(all);
  }

  private buildTree(
    categories: Array<{
      id: string;
      name: string;
      slug: string;
      icon: string | null;
      imageUrl: string | null;
      description: string | null;
      parentId: string | null;
      sortOrder: number;
      isVisible: boolean;
    }>,
  ): CategoryNode[] {
    const map = new Map<string, CategoryNode>();
    const roots: CategoryNode[] = [];

    for (const c of categories) {
      map.set(c.id, { ...c, children: [] });
    }

    for (const c of categories) {
      const node = map.get(c.id)!;
      if (c.parentId && map.has(c.parentId)) {
        map.get(c.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
  }

  async getById(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        children: { orderBy: { sortOrder: 'desc' } },
        products: { select: { productId: true } },
      },
    });
    if (!category) throw new NotFoundException('分类不存在');
    return {
      ...category,
      productCount: category.products.length,
    };
  }

  async getBySlug(slug: string) {
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        children: { orderBy: { sortOrder: 'desc' } },
        products: { select: { productId: true } },
      },
    });
    if (!category) throw new NotFoundException('分类不存在');
    return {
      ...category,
      productCount: category.products.length,
    };
  }

  async create(dto: CreateCategoryDto, file?: Express.Multer.File) {
    const existing = await prisma.category.findUnique({ where: { slug: dto.slug } });
    if (existing) throw new ConflictException('分类 slug 已存在');

    if (dto.parentId) {
      const parent = await prisma.category.findUnique({ where: { id: dto.parentId } });
      if (!parent) throw new BadRequestException('父分类不存在');
    }

    const data: any = { ...dto };

    if (file) {
      const result = await this.mediaService.uploadFile(file, 'categories');
      data.imageUrl = result.fileUrl;
    }

    return prisma.category.create({ data });
  }

  async update(id: string, dto: UpdateCategoryDto, file?: Express.Multer.File) {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('分类不存在');

    if (dto.slug && dto.slug !== category.slug) {
      const existing = await prisma.category.findUnique({ where: { slug: dto.slug } });
      if (existing) throw new ConflictException('分类 slug 已存在');
    }

    if (dto.parentId) {
      if (dto.parentId === id) throw new BadRequestException('不能将分类设为自己的子分类');
      const parent = await prisma.category.findUnique({ where: { id: dto.parentId } });
      if (!parent) throw new BadRequestException('父分类不存在');
    }

    const data: any = { ...dto };

    if (file) {
      const result = await this.mediaService.uploadFile(file, 'categories');
      data.imageUrl = result.fileUrl;
    }

    return prisma.category.update({ where: { id }, data });
  }

  async delete(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        children: true,
        products: { select: { productId: true } },
      },
    });
    if (!category) throw new NotFoundException('分类不存在');
    if (category.children.length > 0) {
      throw new BadRequestException('请先删除子分类');
    }
    if (category.products.length > 0) {
      throw new BadRequestException('该分类下有关联产品，请先移除关联');
    }

    return prisma.category.delete({ where: { id } });
  }

  async updateSort(items: SortCategoryDto[]) {
    const ops = items.map((item) =>
      prisma.category.update({
        where: { id: item.id },
        data: { sortOrder: item.sortOrder },
      }),
    );
    await prisma.$transaction(ops);
    return { success: true };
  }
}
