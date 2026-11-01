import { IsIn, IsString, MinLength } from 'class-validator';

/** Allowed progress states, matching the ProgressRecord contract. */
const STATUSES = ['not-started', 'in-progress', 'completed'] as const;

/** Body for PUT /api/progress/:userId — set the status of one curriculum item. */
export class SetProgressDto {
  @IsString()
  @MinLength(1)
  phaseId!: string;

  @IsString()
  @MinLength(1)
  itemKey!: string;

  @IsIn(STATUSES)
  status!: (typeof STATUSES)[number];
}
