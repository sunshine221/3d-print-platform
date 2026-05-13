import { IsString, MinLength } from 'class-validator';

export class AdminLoginDto {
  @IsString()
  account: string;

  @IsString()
  password: string;
}

export class AdminRefreshDto {
  @IsString()
  refreshToken: string;
}

export class AdminChangePasswordDto {
  @IsString()
  currentPassword: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
}
