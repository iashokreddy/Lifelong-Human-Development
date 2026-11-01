import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { UserRole } from '../shared/contract';
import { RolesGuard } from './roles.guard';

/** Build a minimal ExecutionContext whose request carries the given user role. */
function contextWithRole(role: UserRole | undefined): ExecutionContext {
  const request = role ? { user: { userId: 'u1', role } } : {};
  return {
    switchToHttp: () => ({ getRequest: () => request }),
    getHandler: () => () => undefined,
    getClass: () => class {},
  } as unknown as ExecutionContext;
}

/** A reflector stub that returns a fixed set of required roles. */
function reflectorReturning(roles: UserRole[] | undefined): Reflector {
  return {
    getAllAndOverride: () => roles,
  } as unknown as Reflector;
}

describe('RolesGuard', () => {
  it('allows when the user role is in the @Roles list', () => {
    const guard = new RolesGuard(reflectorReturning(['admin', 'educator']));
    expect(guard.canActivate(contextWithRole('admin'))).toBe(true);
  });

  it('denies when the user role is not in the @Roles list', () => {
    const guard = new RolesGuard(reflectorReturning(['admin']));
    expect(() => guard.canActivate(contextWithRole('learner'))).toThrow(
      ForbiddenException,
    );
  });

  it('passes through when no roles metadata is present', () => {
    const guard = new RolesGuard(reflectorReturning(undefined));
    expect(guard.canActivate(contextWithRole('learner'))).toBe(true);
  });

  it('passes through when the roles list is empty', () => {
    const guard = new RolesGuard(reflectorReturning([]));
    expect(guard.canActivate(contextWithRole(undefined))).toBe(true);
  });
});
