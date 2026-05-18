import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';
import * as https from 'https';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') || '*',
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  await app.init();

  const expressApp = app.getHttpAdapter().getInstance();
  const httpPort = Number(process.env.PORT) || 4000;
  const httpsPort = Number(process.env.HTTPS_PORT) || 4443;

  // HTTP — 给前端/管理后台内部代理使用
  http.createServer(expressApp).listen(httpPort, '0.0.0.0', () => {
    console.log(`Server (HTTP)  running on http://localhost:${httpPort}`);
  });

  // HTTPS — 给外部直接访问 / 生产部署使用
  const certDir = path.resolve(__dirname, '../../../certs');
  if (fs.existsSync(path.join(certDir, 'key.pem'))) {
    const key = fs.readFileSync(path.join(certDir, 'key.pem'));
    const cert = fs.readFileSync(path.join(certDir, 'cert.pem'));
    https.createServer({ key, cert }, expressApp).listen(httpsPort, '0.0.0.0', () => {
      console.log(`Server (HTTPS) running on https://localhost:${httpsPort}`);
    });
  } else {
    console.log('HTTPS not enabled (certs/key.pem not found)');
  }
}
bootstrap();
