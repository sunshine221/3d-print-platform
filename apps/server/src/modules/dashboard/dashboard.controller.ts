import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAdminGuard } from '../../common/guards/jwt-admin.guard';
import { DashboardService } from './dashboard.service';

@Controller('admin/dashboard')
@UseGuards(JwtAdminGuard)
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('stats')
  getStats() {
    return this.dashboardService.getStats();
  }

  @Get('recent-orders')
  getRecentOrders() {
    return this.dashboardService.getRecentOrders();
  }

  @Get('recent-inquiries')
  getRecentInquiries() {
    return this.dashboardService.getRecentInquiries();
  }
}
