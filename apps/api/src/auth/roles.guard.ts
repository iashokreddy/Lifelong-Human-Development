import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { UserRole } from '../shared/contract';
import { ROLES_KEY } from './roles.decorator';
import type { AuthenticatedUser } from './jwt.strategy';

/**
 * Role-based access guard.
 *
 * Reads the roles required by @Roles(...) from the handler/class. If none are
 * required the request passes through. Otherwise the authenticated user's role
 * must be in the list, or a ForbiddenException is thrown.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[] | undefined>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: AuthenticatedUser }>();
    const user = request.user;

    if (user && requiredRoles.includes(user.role)) {
      return true;
    }

    throw new ForbiddenException('You do not have the required role for this action.');
  }
}
