import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  MaxLength,
  IsIn,
  IsNumber,
  IsDateString,
} from 'class-validator';

export class CreateInquiryDto {
  @IsOptional()
  @IsString()
  productId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  desiredMaterial?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  desiredColor?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  desiredQuantity?: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  desiredSize?: string;

  @IsOptional()
  @IsDateString()
  desiredDeadline?: string;

  @IsOptional()
  @IsString()
  additionalNotes?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  contactName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  contactPhone?: string;
}

export class QuoteDto {
  @IsNumber()
  @Min(0)
  adminQuoteUnitPrice: number;

  @IsInt()
  @Min(1)
  adminQuoteQuantity: number;

  @IsOptional()
  @IsString()
  adminQuoteNote?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  adminQuoteDeliveryDays?: number;
}

export class UpdateInquiryStatusDto {
  @IsString()
  @IsIn(['pending_review', 'quoted', 'negotiating', 'accepted', 'rejected', 'closed'])
  status: string;

  @IsOptional()
  @IsString()
  detail?: string;
}

export class SendMessageDto {
  @IsString()
  @MaxLength(2000)
  content: string;
}
