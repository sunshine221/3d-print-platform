import { Controller, Post, Body, Req } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { PrismaClient } from '@prisma/client';
import { Request } from 'express';

const prisma = new PrismaClient();

@Controller('page-views')
export class PageViewController {
  @Public()
  @Post()
  async track(@Body() body: { pagePath: string; referrer?: string }, @Req() req: Request) {
    const userId = (req as any).user?.id || null;
    try {
      await prisma.pageView.create({
        data: {
          pagePath: body.pagePath,
          referrer: body.referrer || req.headers.referer || null,
          ipAddress: req.ip || null,
          userId,
        },
      });
    } catch { /* 静默失败，不影响主流程 */ }
    return { success: true };
  }
}
