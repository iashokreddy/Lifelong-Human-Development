import { Inject, Injectable } from '@nestjs/common';
import type { UserRole } from '../shared/contract';
import {
  CAREGIVER_LINK_REPOSITORY,
  type CaregiverLinkRepository,
} from '../persistence/repositories';

/**
 * The SINGLE access-control choke point for user-scoped data.
 *
 * Every read or write that targets a particular user's data — profiles,
 * progress, data-export, data-delete — must authorise through this service and
 * nowhere else. Centralising the rule keeps child-data protection structural:
 * there are no scattered ad-hoc ownership checks to drift out of sync.
 *
 * Access is granted when the actor is:
 *   - the subject themselves (self), OR
 *   - an admin, OR
 *   - a caregiver with an existing CaregiverLink to the subject (the learner).
 */
@Injectable()
export class CaregiverAccessService {
  constructor(
    @Inject(CAREGIVER_LINK_REPOSITORY)
    private readonly links: CaregiverLinkRepository,
  ) {}

  async canAccess(
    actorId: string,
    actorRole: UserRole,
    subjectUserId: string,
  ): Promise<boolean> {
    if (actorId === subjectUserId) {
      return true;
    }
    if (actorRole === 'admin') {
      return true;
    }
    return this.links.exists(actorId, subjectUserId);
  }
}
