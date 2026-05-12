import { Controller, Get, Post, Patch, Param, Query, Body, UseGuards } from '@nestjs/common';
import { JwtAdminGuard } from '../../common/guards/jwt-admin.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { InquiryService } from './inquiry.service';
import { QuoteDto, UpdateInquiryStatusDto, SendMessageDto } from './dto/inquiry.dto';

@Controller('admin/inquiries')
@UseGuards(JwtAdminGuard)
export class AdminInquiryController {
  constructor(private inquiryService: InquiryService) {}

  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.inquiryService.findAll({
      page: page || 1,
      pageSize: pageSize || 20,
      status,
      search,
    });
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.inquiryService.findById(id);
  }

  @Post(':id/quote')
  quote(
    @Param('id') id: string,
    @Body() dto: QuoteDto,
    @CurrentUser() admin: { id: string },
  ) {
    return this.inquiryService.quote(id, dto, admin.id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateInquiryStatusDto,
    @CurrentUser() admin: { id: string },
  ) {
    return this.inquiryService.updateStatus(id, dto, {
      type: 'admin',
      id: admin.id,
    });
  }

  @Post(':id/messages')
  sendMessage(
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
    @CurrentUser() admin: { id: string },
  ) {
    return this.inquiryService.adminSendMessage(id, admin.id, dto);
  }
}
