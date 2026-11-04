import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import type { ProgressRecord } from '../shared/contract';
import {
  PROGRESS_REPOSITORY,
  type ProgressRepository,
} from '../persistence/repositories';
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import { CaregiverAccessService } from '../users/caregiver-access.service';
import type { SetProgressDto } from './dto';

/**
 * Learning-progress read/write, ownership-scoped.
 *
 * Both reads and writes authorise through CaregiverAccessService — the single
 * choke point shared with the users module — before any repository call. There
 * are no ad-hoc ownership checks: an actor may touch a subject's progress only
 * when they are the subject, an admin, or a linked caregiver.
 */
@Injectable()
export class ProgressService {
  constructor(
    @Inject(PROGRESS_REPOSITORY) private readonly progress: ProgressRepository,
    private readonly access: CaregiverAccessService,
  ) {}

  /** Read all progress records for a subject, if the actor is authorised. */
  async getProgress(
    actor: AuthenticatedUser,
    subjectUserId: string,
  ): Promise<ProgressRecord[]> {
    await this.assertAccess(actor, subjectUserId);
    return this.progress.findForUser(subjectUserId);
  }

  /** Create or update a single progress record, if the actor is authorised. */
  async setProgress(
    actor: AuthenticatedUser,
    subjectUserId: string,
    input: SetProgressDto,
  ): Promise<ProgressRecord> {
    await this.assertAccess(actor, subjectUserId);
    const record: ProgressRecord = {
      userId: subjectUserId,
      phaseId: input.phaseId,
      itemKey: input.itemKey,
      status: input.status,
      updatedAt: new Date().toISOString(),
    };
    return this.progress.upsert(record);
  }

  private async assertAccess(actor: AuthenticatedUser, subjectUserId: string): Promise<void> {
    const allowed = await this.access.canAccess(actor.userId, actor.role, subjectUserId);
    if (!allowed) {
      throw new ForbiddenException('You may not access this user’s progress.');
    }
  }
}
