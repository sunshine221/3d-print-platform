import { Controller, Get, Param, Patch, Query, Body, UseGuards } from '@nestjs/common';
import { JwtAdminGuard } from '../../common/guards/jwt-admin.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { OrderService } from './order.service';
import { UpdateOrderStatusDto, UpdateTrackingDto } from './dto/order.dto';

@Controller('admin/orders')
@UseGuards(JwtAdminGuard)
export class AdminOrderController {
  constructor(private orderService: OrderService) {}

  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.orderService.findAll({
      page: page || 1,
      pageSize: pageSize || 20,
      status,
      search,
    });
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.orderService.findById(id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser() admin: { id: string },
  ) {
    return this.orderService.updateStatus(id, dto, { type: 'admin', id: admin.id });
  }

  @Patch(':id/tracking')
  updateTracking(@Param('id') id: string, @Body() dto: UpdateTrackingDto) {
    return this.orderService.updateTracking(id, dto);
  }
}
