import { Controller, Get, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAdminGuard } from '../../common/guards/jwt-admin.guard';
import { UserService } from './user.service';

@Controller('admin/users')
@UseGuards(JwtAdminGuard)
export class AdminUserController {
  constructor(private userService: UserService) {}

  @Get()
  findAll(@Query('page') page?: number, @Query('pageSize') pageSize?: number, @Query('search') search?: string) {
    return this.userService.findAll({ page: page || 1, pageSize: pageSize || 20, search });
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Patch(':id/status')
  toggleStatus(@Param('id') id: string) {
    return this.userService.toggleStatus(id);
  }
}
