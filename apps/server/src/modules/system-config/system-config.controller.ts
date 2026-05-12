import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { JwtAdminGuard } from '../../common/guards/jwt-admin.guard';
import { SystemConfigService } from './system-config.service';

@Controller('admin/system-config')
@UseGuards(JwtAdminGuard)
export class SystemConfigController {
  constructor(private systemConfigService: SystemConfigService) {}

  @Get()
  getAll() {
    return this.systemConfigService.getAll();
  }

  @Put()
  setBatch(@Body() body: { key: string; value: string; groupName: string }[]) {
    return this.systemConfigService.setBatch(body);
  }
}
