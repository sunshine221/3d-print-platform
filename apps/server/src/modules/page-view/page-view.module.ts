import { Module } from '@nestjs/common';
import { PageViewController } from './page-view.controller';

@Module({
  controllers: [PageViewController],
})
export class PageViewModule {}
