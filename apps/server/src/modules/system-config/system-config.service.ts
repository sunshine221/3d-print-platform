import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class SystemConfigService {
  async getAll() {
    const configs = await prisma.systemConfig.findMany({ orderBy: { groupName: 'asc' } });
    const grouped: Record<string, Record<string, string>> = {};
    for (const cfg of configs) {
      if (!grouped[cfg.groupName]) grouped[cfg.groupName] = {};
      grouped[cfg.groupName]![cfg.key] = cfg.value ?? '';
    }
    return grouped;
  }

  async get(groupName: string) {
    const configs = await prisma.systemConfig.findMany({
      where: { groupName },
    });
    const result: Record<string, string> = {};
    for (const cfg of configs) {
      result[cfg.key] = cfg.value ?? '';
    }
    return result;
  }

  async set(key: string, value: string, groupName: string) {
    return prisma.systemConfig.upsert({
      where: { key },
      update: { value, groupName },
      create: { key, value, groupName },
    });
  }

  async setBatch(items: { key: string; value: string; groupName: string }[]) {
    await Promise.all(items.map((item) => this.set(item.key, item.value, item.groupName)));
    return this.getAll();
  }
}
