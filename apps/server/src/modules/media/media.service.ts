import { Injectable, BadRequestException } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PrismaClient, FileType } from '@prisma/client';
import { PresignedUrlDto } from './dto/media.dto';
import { storageConfig } from '../../config/storage.config';

const prisma = new PrismaClient();

const SIZE_LIMITS: Record<string, number> = {
  image: 10 * 1024 * 1024,       // 10MB
  model_3d: 50 * 1024 * 1024,    // 50MB
  model_upload: 100 * 1024 * 1024, // 100MB
  other: 10 * 1024 * 1024,
};

const ALLOWED_CONTENT_TYPES: Record<string, string[]> = {
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
  model_3d: ['model/gltf-binary', 'model/gltf+json', 'application/octet-stream'],
  model_upload: [
    'application/sla',
    'application/octet-stream',
    'application/vnd.ms-pki.stl',
    'model/stl',
    'model/obj',
    'application/x-extension-3mf',
  ],
  other: [],
};

// magic bytes 校验预留，后续版本实现自动检测文件类型

@Injectable()
export class MediaService {
  private s3: S3Client;
  private bucket: string;
  private publicBaseUrl: string;

  constructor() {
    const config = storageConfig().storage;
    this.s3 = new S3Client({
      endpoint: config.endpoint,
      region: 'us-east-1',
      credentials: {
        accessKeyId: config.accessKey,
        secretAccessKey: config.secretKey,
      },
      forcePathStyle: true,
    });
    this.bucket = config.bucket;
    this.publicBaseUrl = config.publicBaseUrl;
  }

  async getPresignedUrl(dto: PresignedUrlDto) {
    // 校验文件类型
    const allowedTypes = ALLOWED_CONTENT_TYPES[dto.fileType];
    if (allowedTypes && allowedTypes.length > 0 && !allowedTypes.includes(dto.contentType)) {
      throw new BadRequestException(
        `不支持的文件类型: ${dto.contentType}。允许: ${allowedTypes.join(', ')}`,
      );
    }

    const maxSize: number = (SIZE_LIMITS as Record<string, number>)[dto.fileType] ?? SIZE_LIMITS.other!;
    const ext = dto.fileName.split('.').pop()?.toLowerCase() || '';
    const timestamp = Date.now();
    const key = `${dto.fileType}/${timestamp}-${dto.fileName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: dto.contentType,
      Metadata: {
        'max-size': String(maxSize),
        'file-type': dto.fileType,
      },
    });

    const url = await getSignedUrl(this.s3, command, { expiresIn: 300 });

    return {
      uploadUrl: url,
      fileKey: key,
      fileUrl: `${this.publicBaseUrl}/${key}`,
      maxSize,
      expiresIn: 300,
    };
  }

  async verifyUpload(fileKey: string) {
    try {
      const head = await this.s3.send(
        new HeadObjectCommand({ Bucket: this.bucket, Key: fileKey }),
      );

      const size = head.ContentLength || 0;
      const fileType = head.Metadata?.['file-type'] || 'other';
      const maxSize: number = (SIZE_LIMITS as Record<string, number>)[fileType] ?? SIZE_LIMITS.other!;

      if (size === 0) {
        await this.deleteFile(fileKey);
        throw new BadRequestException('文件为空');
      }

      if (size > maxSize) {
        await this.deleteFile(fileKey);
        throw new BadRequestException(`文件过大，最大允许 ${maxSize / 1024 / 1024}MB`);
      }

      return {
        fileKey,
        fileUrl: `${this.publicBaseUrl}/${fileKey}`,
        fileSize: size,
        verified: true,
      };
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      throw new BadRequestException('文件验证失败，文件可能未上传成功');
    }
  }

  async recordFile(params: {
    fileName: string;
    fileUrl: string;
    fileSize: number;
    fileType: FileType;
    mimeType?: string;
    folderId?: string;
  }) {
    return prisma.mediaLibrary.create({ data: params });
  }

  async deleteFile(fileKey: string) {
    try {
      await this.s3.send(
        new DeleteObjectCommand({ Bucket: this.bucket, Key: fileKey }),
      );
    } catch {
      // 忽略删除失败
    }
  }

  async getMediaList(folderId: string | null, fileType?: string, page = 1, pageSize = 20) {
    const where: any = { folderId };
    if (fileType) where.fileType = fileType;

    const [items, total] = await Promise.all([
      prisma.mediaLibrary.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.mediaLibrary.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async createFolder(name: string, parentId?: string) {
    return prisma.mediaLibrary.create({
      data: {
        fileName: name,
        fileUrl: '',
        fileType: 'other',
        isFolder: true,
        folderId: parentId || null,
      },
    });
  }
}
