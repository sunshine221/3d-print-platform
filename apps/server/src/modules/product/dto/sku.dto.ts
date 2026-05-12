import {
  IsString,
  IsOptional,
  IsNumber,
  IsInt,
  IsIn,
  IsObject,
  Min,
} from 'class-validator';

export class CreateSkuDto {
  @IsOptional()
  @IsString()
  skuCode?: string;

  @IsObject()
  specCombo: Record<string, string>;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  minOrderQty?: number;

  @IsOptional()
  @IsString()
  @IsIn(['in_stock', 'low_stock', 'out_of_stock', 'make_to_order'])
  stockStatus?: string;

  @IsOptional()
  @IsInt()
  leadTimeDays?: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  @IsIn(['active', 'inactive'])
  status?: string;
}

export class UpdateSkuDto {
  @IsOptional()
  @IsString()
  skuCode?: string;

  @IsOptional()
  @IsObject()
  specCombo?: Record<string, string>;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  minOrderQty?: number;

  @IsOptional()
  @IsString()
  @IsIn(['in_stock', 'low_stock', 'out_of_stock', 'make_to_order'])
  stockStatus?: string;

  @IsOptional()
  @IsInt()
  leadTimeDays?: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  @IsIn(['active', 'inactive'])
  status?: string;
}
