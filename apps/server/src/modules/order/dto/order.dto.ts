import {
  IsArray,
  IsString,
  IsOptional,
  IsInt,
  Min,
  MaxLength,
  ValidateNested,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @IsString()
  productId: string;

  @IsString()
  skuId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  @IsString()
  @MaxLength(100)
  contactName: string;

  @IsString()
  @MaxLength(30)
  contactPhone: string;

  @IsString()
  @MaxLength(500)
  shippingAddress: string;

  @IsOptional()
  @IsString()
  couponCode?: string;
}

export class UpdateOrderStatusDto {
  @IsString()
  @IsIn(['in_production', 'shipped', 'completed', 'cancelled'])
  status: string;

  @IsOptional()
  @IsString()
  detail?: string;
}

export class UpdateTrackingDto {
  @IsString()
  trackingNumber: string;

  @IsString()
  @IsOptional()
  trackingCompany?: string;
}
