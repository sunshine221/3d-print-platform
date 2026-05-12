import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuthModule } from './modules/auth/auth.module';
import { AdminAuthModule } from './modules/admin-auth/admin-auth.module';
import { UserModule } from './modules/user/user.module';
import { CategoryModule } from './modules/category/category.module';
import { ProductModule } from './modules/product/product.module';
import { MediaModule } from './modules/media/media.module';
import { BannerModule } from './modules/banner/banner.module';
import { PageModule } from './modules/page/page.module';
import { OrderModule } from './modules/order/order.module';
import { InquiryModule } from './modules/inquiry/inquiry.module';
import { SystemConfigModule } from './modules/system-config/system-config.module';
import { ContactModule } from './modules/contact/contact.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { LogModule } from './modules/log/log.module';
import { PageViewModule } from './modules/page-view/page-view.module';
import { OperationLogInterceptor } from './common/interceptors/operation-log.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 100,
      },
    ]),
    AuthModule,
    AdminAuthModule,
    UserModule,
    CategoryModule,
    ProductModule,
    MediaModule,
    BannerModule,
    PageModule,
    OrderModule,
    InquiryModule,
    SystemConfigModule,
    ContactModule,
    DashboardModule,
    LogModule,
    PageViewModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: OperationLogInterceptor,
    },
  ],
})
export class AppModule {}
