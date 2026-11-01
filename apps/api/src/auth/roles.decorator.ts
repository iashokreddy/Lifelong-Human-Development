import { SetMetadata } from '@nestjs/common';
import type { UserRole } from '../shared/contract';

/** Metadata key under which required roles are stored. */
export const ROLES_KEY = 'roles';

/**
 * Restrict a route (or controller) to the listed roles.
 *
 * Used together with RolesGuard. With no roles listed the guard passes through.
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
