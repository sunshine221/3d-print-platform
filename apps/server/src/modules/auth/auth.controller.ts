import { Controller, Post, Get, Body, HttpCode, UseGuards, Patch } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import {
  RegisterDto,
  LoginDto,
  RefreshDto,
  SendCodeDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
} from './dto/auth.dto';
import { UpdateProfileRequest } from '@3d-print/types';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Controller('auth')
@UseGuards(JwtAuthGuard)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(200)
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post('logout')
  @HttpCode(200)
  logout(@CurrentUser() user: { id: string }) {
    return this.authService.logout(user.id);
  }

  @Public()
  @Post('send-code')
  @HttpCode(200)
  sendCode(@Body() dto: SendCodeDto) {
    return this.authService.sendCode(dto.email);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(200)
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(200)
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Post('change-password')
  @HttpCode(200)
  changePassword(@CurrentUser() user: { id: string }, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(user.id, dto);
  }

  @Get('me')
  getMe(@CurrentUser() user: { id: string }) {
    return this.authService.getMe(user.id);
  }

  @Patch('me')
  async updateMe(@CurrentUser() user: { id: string }, @Body() dto: UpdateProfileRequest) {
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: dto.name,
        phone: dto.phone,
        avatarUrl: dto.avatarUrl,
        defaultContactName: dto.defaultContactName,
        defaultContactPhone: dto.defaultContactPhone,
        defaultAddress: dto.defaultAddress,
      },
    });

    return {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      phone: updated.phone,
      avatarUrl: updated.avatarUrl,
    };
  }
}
