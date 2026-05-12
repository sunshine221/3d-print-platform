import { Module } from '@nestjs/common';
import { BannerController } from './banner.controller';
import { AdminBannerController } from './admin-banner.controller';
import { BannerService } from './banner.service';

@Module({
  controllers: [BannerController, AdminBannerController],
  providers: [BannerService],
})
export class BannerModule {}
