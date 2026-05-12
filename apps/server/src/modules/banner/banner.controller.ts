import { Controller, Get } from '@nestjs/common';
import { BannerService } from './banner.service';
import { Public } from '../../common/decorators/public.decorator';

@Controller('banners')
export class BannerController {
  constructor(private bannerService: BannerService) {}

  @Public()
  @Get()
  findAll() {
    return this.bannerService.findActive();
  }
}
