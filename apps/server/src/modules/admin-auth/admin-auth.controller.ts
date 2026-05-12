import { Controller, Post, Get, Body, HttpCode, UseGuards } from '@nestjs/common';
import { AdminAuthService } from './admin-auth.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAdminGuard } from '../../common/guards/jwt-admin.guard';
import { AdminLoginDto, AdminRefreshDto, AdminChangePasswordDto } from './dto/admin-auth.dto';

@Controller('admin/auth')
@UseGuards(JwtAdminGuard)
export class AdminAuthController {
  constructor(private adminAuthService: AdminAuthService) {}

  @Public()
  @Post('login')
  @HttpCode(200)
  login(@Body() dto: AdminLoginDto) {
    return this.adminAuthService.login(dto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(200)
  refresh(@Body() dto: AdminRefreshDto) {
    return this.adminAuthService.refresh(dto.refreshToken);
  }

  @Post('logout')
  @HttpCode(200)
  logout(@CurrentUser() user: { id: string }) {
    return this.adminAuthService.logout(user.id);
  }

  @Get('me')
  getMe(@CurrentUser() user: { id: string }) {
    return this.adminAuthService.getMe(user.id);
  }

  @Post('change-password')
  @HttpCode(200)
  changePassword(
    @CurrentUser() user: { id: string },
    @Body() dto: AdminChangePasswordDto,
  ) {
    return this.adminAuthService.changePassword(user.id, dto);
  }
}
