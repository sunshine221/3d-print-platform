import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user?.roleId) return false;

    const role = await prisma.role.findUnique({ where: { id: user.roleId } });
    if (!role) return false;

    const permissions: string[] =
      typeof role.permissions === 'string'
        ? JSON.parse(role.permissions as string)
        : (role.permissions as string[]);

    return requiredRoles.some((r) => permissions.includes(r));
  }
}
