import { Injectable } from '@nestjs/common';
import type { CaregiverLink, CaregiverLinkRepository } from '../repositories';

/** In-memory CaregiverLinkRepository backed by a Map keyed by "caregiver|learner". */
@Injectable()
export class InMemoryCaregiverLinkRepository implements CaregiverLinkRepository {
  private readonly links = new Map<string, CaregiverLink>();

  private key(caregiverId: string, learnerId: string): string {
    return `${caregiverId}|${learnerId}`;
  }

  async link(link: CaregiverLink): Promise<CaregiverLink> {
    this.links.set(this.key(link.caregiverId, link.learnerId), { ...link });
    return { ...link };
  }

  async unlink(caregiverId: string, learnerId: string): Promise<boolean> {
    return this.links.delete(this.key(caregiverId, learnerId));
  }

  async exists(caregiverId: string, learnerId: string): Promise<boolean> {
    return this.links.has(this.key(caregiverId, learnerId));
  }

  async listForCaregiver(caregiverId: string): Promise<CaregiverLink[]> {
    return [...this.links.values()]
      .filter((l) => l.caregiverId === caregiverId)
      .map((l) => ({ ...l }));
  }

  async listForLearner(learnerId: string): Promise<CaregiverLink[]> {
    return [...this.links.values()]
      .filter((l) => l.learnerId === learnerId)
      .map((l) => ({ ...l }));
  }
}
