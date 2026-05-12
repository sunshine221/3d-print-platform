import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { AdminOrderController } from './admin-order.controller';

@Module({
  controllers: [OrderController, AdminOrderController],
  providers: [OrderService],
})
export class OrderModule {}
