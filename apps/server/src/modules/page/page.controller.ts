import { Controller, Get, Param } from '@nestjs/common';
import { PageService } from './page.service';
import { Public } from '../../common/decorators/public.decorator';

@Controller('pages')
export class PageController {
  constructor(private pageService: PageService) {}

  @Public()
  @Get(':slug')
  getBySlug(@Param('slug') slug: string) {
    return this.pageService.findBySlug(slug);
  }
}
