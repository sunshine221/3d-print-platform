import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { SkuService } from './sku.service';
import { ProductController } from './product.controller';
import { AdminProductController } from './admin-product.controller';

@Module({
  controllers: [ProductController, AdminProductController],
  providers: [ProductService, SkuService],
  exports: [ProductService, SkuService],
})
export class ProductModule {}
