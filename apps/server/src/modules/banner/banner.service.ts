import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { MediaService } from '../media/media.service';

const prisma = new PrismaClient();

@Injectable()
export class BannerService {
  constructor(private mediaService: MediaService) {}

  async findActive() {
    return prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findAll(query: { page: number; pageSize: number }) {
    const [items, total] = await Promise.all([
      prisma.banner.findMany({
        orderBy: { sortOrder: 'asc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      prisma.banner.count(),
    ]);
    return {
      items,
      pagination: { page: query.page, pageSize: query.pageSize, total, totalPages: Math.ceil(total / query.pageSize) },
    };
  }

  async findById(id: string) {
    const banner = await prisma.banner.findUnique({ where: { id } });
    if (!banner) throw new NotFoundException('Banner 不存在');
    return banner;
  }

  async create(
    dto: { title?: string; subtitle?: string; imageUrl?: string; linkUrl?: string; sortOrder?: number; isActive?: boolean },
    file?: Express.Multer.File,
  ) {
    let imageUrl = dto.imageUrl;

    if (file) {
      const result = await this.mediaService.uploadFile(file, 'banners');
      imageUrl = result.fileUrl;
    }

    if (!imageUrl) throw new NotFoundException('请提供图片（上传文件或填写 URL）');

    return prisma.banner.create({ data: { ...dto, imageUrl } as any });
  }

  async update(
    id: string,
    dto: { title?: string; subtitle?: string; imageUrl?: string; linkUrl?: string; sortOrder?: number; isActive?: boolean },
    file?: Express.Multer.File,
  ) {
    await this.findById(id);

    const data: any = { ...dto };

    if (file) {
      const result = await this.mediaService.uploadFile(file, 'banners');
      data.imageUrl = result.fileUrl;
    }

    return prisma.banner.update({ where: { id }, data });
  }

  async delete(id: string) {
    await this.findById(id);
    await prisma.banner.delete({ where: { id } });
    return { success: true };
  }
}
