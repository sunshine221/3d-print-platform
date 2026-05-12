import { Module } from '@nestjs/common';
import { PageController } from './page.controller';
import { AdminPageController } from './admin-page.controller';
import { PageService } from './page.service';

@Module({
  controllers: [PageController, AdminPageController],
  providers: [PageService],
})
export class PageModule {}
