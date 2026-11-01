import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthenticatedUser } from './jwt.strategy';

/**
 * Inject the authenticated user (set by JwtStrategy) into a handler parameter.
 *
 * Usage: `methodName(@CurrentUser() actor: AuthenticatedUser)`.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedUser => {
    const request = context.switchToHttp().getRequest<{ user: AuthenticatedUser }>();
    return request.user;
  },
);
