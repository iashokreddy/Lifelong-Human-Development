import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** Guard that requires a valid JWT. Attaches the authenticated user to the request. */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
