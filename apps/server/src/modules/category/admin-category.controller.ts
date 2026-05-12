import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAdminGuard } from '../../common/guards/jwt-admin.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CategoryService } from './category.service';
import { CreateCategoryDto, UpdateCategoryDto, SortCategoryDto } from './dto/category.dto';

@Controller('admin/categories')
@UseGuards(JwtAdminGuard, RolesGuard)
export class AdminCategoryController {
  constructor(private categoryService: CategoryService) {}

  @Get()
  getTree() {
    return this.categoryService.getAdminTree();
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.categoryService.getById(id);
  }

  @Post()
  @Roles('category:write')
  create(@Body() dto: CreateCategoryDto) {
    return this.categoryService.create(dto);
  }

  @Put(':id')
  @Roles('category:write')
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoryService.update(id, dto);
  }

  @Delete(':id')
  @Roles('category:write')
  delete(@Param('id') id: string) {
    return this.categoryService.delete(id);
  }

  @Put('sort/batch')
  @Roles('category:write')
  updateSort(@Body() items: SortCategoryDto[]) {
    return this.categoryService.updateSort(items);
  }
}
