import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductQueryDto } from './dto/product.dto';
import { Public } from '../../common/decorators/public.decorator';

@Controller('products')
export class ProductController {
  constructor(private productService: ProductService) {}

  @Public()
  @Get()
  findAll(@Query() query: ProductQueryDto) {
    return this.productService.findPublished({
      page: query.page || 1,
      pageSize: query.pageSize || 20,
      category: query.category,
      material: query.material,
      technique: query.technique,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
      color: query.color,
      tolerance: query.tolerance,
      search: query.search,
      sort: query.sort,
    });
  }

  @Public()
  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.productService.findBySlug(slug);
  }

  @Public()
  @Get(':slug/related')
  findRelated(@Param('slug') slug: string) {
    return this.productService.findRelated(slug);
  }
}
