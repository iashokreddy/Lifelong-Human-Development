import { IsBoolean, IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

/** Body for PATCH /api/users/:id — only mutable, data-minimising profile fields. */
export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  displayName?: string;
}

/** Body for POST /api/users/minors — caregiver-mediated minor account creation. */
export class CreateMinorDto {
  @IsString()
  @MinLength(1)
  displayName!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;
}

/** Body for POST /api/users/links — link a caregiver (the actor) to a learner. */
export class LinkLearnerDto {
  @IsString()
  @MinLength(1)
  learnerId!: string;
}
