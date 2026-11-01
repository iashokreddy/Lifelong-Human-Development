import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { UserRole } from '../shared/contract';
import {
  USER_REPOSITORY,
  type User,
  type UserRepository,
} from '../persistence/repositories';
import type { LoginDto, RegisterDto } from './dto';

/** Cost factor for bcrypt hashing. 10 is a sensible default for interactive logins. */
const BCRYPT_ROUNDS = 10;

/** The signed JWT payload. `sub` is the user id. */
export interface JwtPayload {
  sub: string;
  role: UserRole;
}

/** What a successful login returns to the client. */
export interface AuthResult {
  accessToken: string;
  user: { id: string; email: string; displayName: string; role: UserRole };
}

/**
 * Authentication service.
 *
 * Passwords are always stored as bcrypt hashes — never in plaintext. Tokens are
 * signed with the configured JWT secret and carry only the user id and role, so
 * downstream guards can make access decisions without another database read.
 */
@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    private readonly jwt: JwtService,
  ) {}

  /** Register a new account, hashing the password before it is persisted. */
  async register(dto: RegisterDto): Promise<AuthResult> {
    const existing = await this.users.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('An account with that email already exists.');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = await this.users.create({
      email: dto.email,
      passwordHash,
      displayName: dto.displayName,
      role: dto.role ?? 'learner',
      isMinor: dto.isMinor ?? false,
    });

    return this.buildResult(user);
  }

  /** Validate credentials, returning the user on success or null otherwise. */
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.users.findByEmail(email);
    if (!user) {
      return null;
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    return ok ? user : null;
  }

  /** Authenticate and issue a signed JWT. */
  async login(dto: LoginDto): Promise<AuthResult> {
    const user = await this.validateUser(dto.email, dto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }
    return this.buildResult(user);
  }

  private buildResult(user: User): AuthResult {
    const payload: JwtPayload = { sub: user.id, role: user.role };
    const accessToken = this.jwt.sign(payload);
    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
      },
    };
  }
}
