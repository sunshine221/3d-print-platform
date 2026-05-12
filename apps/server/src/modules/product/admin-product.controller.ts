import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAdminGuard } from '../../common/guards/jwt-admin.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ProductService } from './product.service';
import { SkuService } from './sku.service';
import { CreateProductDto, UpdateProductDto, BatchOperationDto, ProductQueryDto } from './dto/product.dto';
import { CreateSkuDto, UpdateSkuDto } from './dto/sku.dto';

@Controller('admin/products')
@UseGuards(JwtAdminGuard, RolesGuard)
export class AdminProductController {
  constructor(
    private productService: ProductService,
    private skuService: SkuService,
  ) {}

  // ===== 产品 CRUD =====

  @Get()
  list(@Query() query: ProductQueryDto) {
    return this.productService.findAll({
      page: query.page || 1,
      pageSize: query.pageSize || 20,
      category: query.category,
      material: query.material,
      technique: query.technique,
      search: query.search,
      status: query.status,
      sort: query.sort,
    });
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.productService.findById(id);
  }

  @Post()
  @Roles('product:write')
  create(@Body() dto: CreateProductDto) {
    return this.productService.create(dto);
  }

  @Put(':id')
  @Roles('product:write')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productService.update(id, dto);
  }

  @Delete(':id')
  @Roles('product:write')
  delete(@Param('id') id: string) {
    return this.productService.delete(id);
  }

  @Patch('batch')
  @Roles('product:write')
  batchOperation(@Body() dto: BatchOperationDto) {
    return this.productService.batchOperation(dto);
  }

  // ===== SKU 子资源 =====

  @Get(':id/skus')
  getSkus(@Param('id') id: string) {
    return this.skuService.findByProductId(id);
  }

  @Post(':id/skus')
  @Roles('product:write')
  createSku(@Param('id') id: string, @Body() dto: CreateSkuDto) {
    return this.skuService.create(id, dto);
  }

  @Put(':id/skus/:skuId')
  @Roles('product:write')
  updateSku(
    @Param('id') id: string,
    @Param('skuId') skuId: string,
    @Body() dto: UpdateSkuDto,
  ) {
    return this.skuService.update(id, skuId, dto);
  }

  @Delete(':id/skus/:skuId')
  @Roles('product:write')
  deleteSku(@Param('id') id: string, @Param('skuId') skuId: string) {
    return this.skuService.delete(id, skuId);
  }

  // ===== 图片管理 =====

  @Post(':id/images')
  @Roles('product:write')
  addImage(
    @Param('id') id: string,
    @Body() body: { url: string; altText?: string; isPrimary?: boolean },
  ) {
    return this.productService.addImage(id, body);
  }

  @Put(':id/images/:imageId/sort')
  @Roles('product:write')
  updateImageSort(
    @Param('id') id: string,
    @Param('imageId') imageId: string,
    @Body() body: { sortOrder: number },
  ) {
    return this.productService.updateImageSort(id, imageId, body.sortOrder);
  }

  @Put(':id/images/:imageId/primary')
  @Roles('product:write')
  setPrimaryImage(@Param('id') id: string, @Param('imageId') imageId: string) {
    return this.productService.setPrimaryImage(id, imageId);
  }

  @Delete(':id/images/:imageId')
  @Roles('product:write')
  deleteImage(@Param('id') id: string, @Param('imageId') imageId: string) {
    return this.productService.deleteImage(id, imageId);
  }

  // ===== 3D 模型 =====

  @Post(':id/model3d')
  @Roles('product:write')
  upsertModel3D(
    @Param('id') id: string,
    @Body()
    body: { fileUrl: string; fileName?: string; fileSize?: number; thumbnailUrl?: string },
  ) {
    return this.productService.upsertModel3D(id, body);
  }
}
