import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { JwtAdminGuard } from '../../common/guards/jwt-admin.guard';
import { BannerService } from './banner.service';

@Controller('admin/banners')
@UseGuards(JwtAdminGuard)
export class AdminBannerController {
  constructor(private bannerService: BannerService) {}

  @Get()
  findAll(@Query('page') page?: number, @Query('pageSize') pageSize?: number) {
    return this.bannerService.findAll({ page: page || 1, pageSize: pageSize || 20 });
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.bannerService.findById(id);
  }

  @Post()
  create(@Body() body: any) {
    return this.bannerService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.bannerService.update(id, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.bannerService.delete(id);
  }
}
