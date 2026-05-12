import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaClient } from '@prisma/client';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';

const prisma = new PrismaClient();

@Injectable()
export class OperationLogInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<Request>();
    const method = req.method;

    if (!['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
      return next.handle();
    }

    const adminUser = (req as any).user;
    if (!adminUser?.id) return next.handle();

    const targetType = req.path.split('/')[3] || 'unknown';
    const targetId = req.params?.id || null;

    return next.handle().pipe(
      tap(() => {
        const detail: any = {};
        if (req.body && Object.keys(req.body).length > 0) {
          detail.body = this.sanitize(req.body);
        }
        if (req.query && Object.keys(req.query).length > 0) {
          detail.query = req.query;
        }

        prisma.operationLog
          .create({
            data: {
              adminUserId: adminUser.id,
              action: method,
              targetType,
              targetId,
              detail,
              ipAddress: req.ip,
              userAgent: req.headers['user-agent'] || null,
            },
          })
          .catch(() => {});
      }),
    );
  }

  private sanitize(body: any): any {
    if (!body) return body;
    const sanitized = { ...body };
    for (const key of ['password', 'passwordHash', 'newPassword', 'currentPassword', 'token']) {
      delete sanitized[key];
    }
    return sanitized;
  }
}
