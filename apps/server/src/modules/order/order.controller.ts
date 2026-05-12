import { Controller, Post, Get, Param, Body, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/order.dto';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Post()
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateOrderDto) {
    return this.orderService.create(user.id, dto);
  }

  @Get()
  findByUser(
    @CurrentUser() user: { id: string },
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.orderService.findByUser(user.id, {
      page: page || 1,
      pageSize: pageSize || 20,
    });
  }

  @Get(':id')
  findById(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.orderService.findByIdAndUser(id, user.id);
  }
}
