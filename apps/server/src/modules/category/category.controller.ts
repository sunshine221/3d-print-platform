import { Controller, Get, Param } from '@nestjs/common';
import { CategoryService } from './category.service';
import { Public } from '../../common/decorators/public.decorator';

@Controller('categories')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Public()
  @Get()
  getTree() {
    return this.categoryService.getTree();
  }

  @Public()
  @Get(':slug')
  getBySlug(@Param('slug') slug: string) {
    return this.categoryService.getBySlug(slug);
  }
}
