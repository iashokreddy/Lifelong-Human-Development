import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import * as bcrypt from 'bcrypt';
import type { UserRole } from '../shared/contract';
import {
  CAREGIVER_LINK_REPOSITORY,
  PROGRESS_REPOSITORY,
  USER_REPOSITORY,
  type CaregiverLinkRepository,
  type ProgressRepository,
  type User,
  type UserRepository,
} from '../persistence/repositories';
import type { ProgressRecord } from '../shared/contract';
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import { CaregiverAccessService } from './caregiver-access.service';
import type { CreateMinorDto, UpdateProfileDto } from './dto';

/** A profile view that never exposes the password hash (data minimisation). */
export interface PublicProfile {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  isMinor: boolean;
}

/** A DPDP data-export bundle: the user's profile plus their progress records. */
export interface DataExportBundle {
  profile: PublicProfile;
  progress: ProgressRecord[];
  exportedAt: string;
}

/** Roles permitted to act as a caregiver for a minor account. */
const CAREGIVER_ROLES: UserRole[] = ['parent', 'guardian', 'educator', 'admin'];

const BCRYPT_ROUNDS = 10;

/**
 * User profile and caregiver-link management.
 *
 * Every operation that touches another user's data routes through
 * CaregiverAccessService — the single enforcement point. Minor accounts are
 * caregiver-mediated: they can only be created by a caregiver actor and are
 * auto-linked to that caregiver at creation.
 */
@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(CAREGIVER_LINK_REPOSITORY)
    private readonly links: CaregiverLinkRepository,
    @Inject(PROGRESS_REPOSITORY)
    private readonly progress: ProgressRepository,
    private readonly access: CaregiverAccessService,
  ) {}

  /** Fetch a profile, authorised through the caregiver-access choke point. */
  async getProfile(actor: AuthenticatedUser, subjectUserId: string): Promise<PublicProfile> {
    await this.assertAccess(actor, subjectUserId);
    const user = await this.users.findById(subjectUserId);
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    return this.toPublic(user);
  }

  /**
   * Update a profile's mutable fields, authorised through the choke point.
   *
   * displayName is the only mutable, data-minimising field. The repository
   * exposes an upsert-style create that replaces the row for a known id, so the
   * edited entity is written back under its existing id.
   */
  async updateProfile(
    actor: AuthenticatedUser,
    subjectUserId: string,
    dto: UpdateProfileDto,
  ): Promise<PublicProfile> {
    await this.assertAccess(actor, subjectUserId);
    const user = await this.users.findById(subjectUserId);
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    const updated: User = {
      ...user,
      displayName: dto.displayName ?? user.displayName,
    };
    await this.users.save(updated);
    return this.toPublic(updated);
  }

  /** Link the actor (a caregiver) to a learner, enabling mediated access. */
  async linkLearner(actor: AuthenticatedUser, learnerId: string): Promise<void> {
    const learner = await this.users.findById(learnerId);
    if (!learner) {
      throw new NotFoundException('Learner not found.');
    }
    await this.links.link({ caregiverId: actor.userId, learnerId });
  }

  /** Remove a caregiver↔learner link. */
  async unlinkLearner(actor: AuthenticatedUser, learnerId: string): Promise<boolean> {
    return this.links.unlink(actor.userId, learnerId);
  }

  /**
   * Create a caregiver-mediated minor account.
   *
   * Requires a caregiver actor (parent/guardian/educator/admin). The new minor
   * account is auto-linked to the creating caregiver so access flows through the
   * same choke point. Data-minimising: stores only displayName (+ optional
   * credentials if the minor will sign in directly).
   */
  async createMinorAccount(
    actor: AuthenticatedUser,
    dto: CreateMinorDto,
  ): Promise<PublicProfile> {
    if (!CAREGIVER_ROLES.includes(actor.role)) {
      throw new ForbiddenException('Only a caregiver may create a minor account.');
    }

    const passwordHash = dto.password
      ? await bcrypt.hash(dto.password, BCRYPT_ROUNDS)
      : await bcrypt.hash(randomUUID(), BCRYPT_ROUNDS);

    const minor = await this.users.create({
      email: dto.email ?? `minor-${randomUUID()}@placeholder.local`,
      passwordHash,
      displayName: dto.displayName,
      role: 'learner',
      isMinor: true,
    });

    await this.links.link({ caregiverId: actor.userId, learnerId: minor.id });
    return this.toPublic(minor);
  }

  /**
   * DPDP right to data portability: export a user's profile and progress as a
   * JSON bundle. Authorised through the caregiver-access choke point.
   */
  async exportData(actor: AuthenticatedUser, subjectUserId: string): Promise<DataExportBundle> {
    await this.assertAccess(actor, subjectUserId);
    const user = await this.users.findById(subjectUserId);
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    const progress = await this.progress.findForUser(subjectUserId);
    return {
      profile: this.toPublic(user),
      progress,
      exportedAt: new Date().toISOString(),
    };
  }

  /**
   * DPDP right to erasure: delete a user along with their caregiver links and
   * progress records. Authorised through the caregiver-access choke point.
   */
  async deleteData(actor: AuthenticatedUser, subjectUserId: string): Promise<void> {
    await this.assertAccess(actor, subjectUserId);
    const user = await this.users.findById(subjectUserId);
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    await this.progress.deleteForUser(subjectUserId);

    // Remove every caregiver link that references this user, in either direction.
    const asLearner = await this.links.listForLearner(subjectUserId);
    const asCaregiver = await this.links.listForCaregiver(subjectUserId);
    for (const link of [...asLearner, ...asCaregiver]) {
      await this.links.unlink(link.caregiverId, link.learnerId);
    }

    await this.users.delete(subjectUserId);
  }

  /** Centralised authorisation — always via CaregiverAccessService. */
  private async assertAccess(actor: AuthenticatedUser, subjectUserId: string): Promise<void> {
    const allowed = await this.access.canAccess(actor.userId, actor.role, subjectUserId);
    if (!allowed) {
      throw new ForbiddenException('You may not access this user’s data.');
    }
  }

  private toPublic(user: User): PublicProfile {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      isMinor: user.isMinor,
    };
  }
}
