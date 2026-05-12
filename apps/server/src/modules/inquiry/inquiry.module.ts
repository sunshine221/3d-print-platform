import { Module } from '@nestjs/common';
import { InquiryService } from './inquiry.service';
import { InquiryController } from './inquiry.controller';
import { AdminInquiryController } from './admin-inquiry.controller';

@Module({
  controllers: [InquiryController, AdminInquiryController],
  providers: [InquiryService],
})
export class InquiryModule {}
