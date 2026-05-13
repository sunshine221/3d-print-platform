import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAdminGuard } from '../../common/guards/jwt-admin.guard';
import { BannerService } from './banner.service';
import { CreateBannerDto, UpdateBannerDto } from './dto/banner.dto';

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
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Body() body: CreateBannerDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.bannerService.create(body, file);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  update(
    @Param('id') id: string,
    @Body() body: UpdateBannerDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.bannerService.update(id, body, file);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.bannerService.delete(id);
  }
}
