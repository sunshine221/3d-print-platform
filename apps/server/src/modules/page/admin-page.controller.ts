import { Controller, Get, Patch, Param, Query, Body, UseGuards } from '@nestjs/common';
import { JwtAdminGuard } from '../../common/guards/jwt-admin.guard';
import { PageService } from './page.service';

@Controller('admin/pages')
@UseGuards(JwtAdminGuard)
export class AdminPageController {
  constructor(private pageService: PageService) {}

  @Get()
  findAll(@Query('page') page?: number, @Query('pageSize') pageSize?: number) {
    return this.pageService.findAll({ page: page || 1, pageSize: pageSize || 20 });
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.pageService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.pageService.update(id, body);
  }
}
