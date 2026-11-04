import { IsBoolean, IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import type { UserRole } from '../shared/contract';

/** Roles a new account may self-register as. Admin is provisioned, never self-assigned. */
const SELF_REGISTERABLE_ROLES: UserRole[] = ['learner', 'parent', 'guardian', 'educator'];

/** Body for POST /api/auth/register. Data-minimising: only what an account needs. */
export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  @MinLength(1)
  displayName!: string;

  @IsOptional()
  @IsIn(SELF_REGISTERABLE_ROLES)
  role?: UserRole;

  @IsOptional()
  @IsBoolean()
  isMinor?: boolean;
}

/** Body for POST /api/auth/login. */
export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(1)
  password!: string;
}
