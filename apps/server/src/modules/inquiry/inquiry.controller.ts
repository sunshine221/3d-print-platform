import { Controller, Post, Get, Param, Body, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { InquiryService } from './inquiry.service';
import { CreateInquiryDto, SendMessageDto } from './dto/inquiry.dto';

@Controller('inquiries')
@UseGuards(JwtAuthGuard)
export class InquiryController {
  constructor(private inquiryService: InquiryService) {}

  @Post()
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateInquiryDto) {
    return this.inquiryService.create(user.id, dto);
  }

  @Get()
  findByUser(
    @CurrentUser() user: { id: string },
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.inquiryService.findByUser(user.id, {
      page: page || 1,
      pageSize: pageSize || 20,
    });
  }

  @Get(':id')
  findById(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.inquiryService.findByIdAndUser(id, user.id);
  }

  @Post(':id/messages')
  sendMessage(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.inquiryService.sendMessage(id, user.id, dto);
  }
}
