import { Controller, Post, Body } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { ContactService } from './contact.service';

@Controller('contact')
export class ContactController {
  constructor(private contactService: ContactService) {}

  @Public()
  @Post()
  create(@Body() body: { name: string; email: string; message: string }) {
    return this.contactService.create(body);
  }
}
