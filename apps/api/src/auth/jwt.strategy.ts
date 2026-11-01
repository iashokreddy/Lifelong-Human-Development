import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { getJwtSecret } from '../config/env';
import type { UserRole } from '../shared/contract';
import type { JwtPayload } from './auth.service';

/** The authenticated principal attached to requests as `request.user`. */
export interface AuthenticatedUser {
  userId: string;
  role: UserRole;
}

/**
 * Passport JWT strategy.
 *
 * Extracts a Bearer token from the Authorization header and verifies it against
 * the configured secret. The validated payload becomes `request.user`.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: getJwtSecret(),
    });
  }

  validate(payload: JwtPayload): AuthenticatedUser {
    return { userId: payload.sub, role: payload.role };
  }
}
