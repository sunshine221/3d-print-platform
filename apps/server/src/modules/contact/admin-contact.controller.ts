import { Controller, Get, Post, Patch, Param, Query, Body, UseGuards } from '@nestjs/common';
import { JwtAdminGuard } from '../../common/guards/jwt-admin.guard';
import { ContactService } from './contact.service';

@Controller('admin/contact')
@UseGuards(JwtAdminGuard)
export class AdminContactController {
  constructor(private contactService: ContactService) {}

  @Get()
  findAll(@Query('page') page?: number, @Query('pageSize') pageSize?: number) {
    return this.contactService.findAll({ page: page || 1, pageSize: pageSize || 20 });
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.contactService.findById(id);
  }

  @Patch(':id/read')
  markRead(@Param('id') id: string) {
    return this.contactService.markRead(id);
  }

  @Post(':id/reply')
  reply(@Param('id') id: string, @Body() body: { reply: string }) {
    return this.contactService.reply(id, body.reply);
  }
}
