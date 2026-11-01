/**
 * Persistence contracts for the LHD API.
 *
 * Repository interfaces + DI tokens form the single abstraction that feature
 * services depend on. An in-memory implementation is the default (used in tests
 * and when no DATABASE_URL is set); a Prisma/Postgres implementation is selected
 * only when a database is configured. Every read/write is keyed so that the
 * caregiver-access choke point (later feature) can enforce ownership.
 */
import type { ProgressRecord, UserRole } from '../shared/contract';

/** A platform user. Minor accounts are caregiver-mediated (isMinor = true). */
export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  isMinor: boolean;
  displayName: string;
}

/** Fields required to create a user (id is assigned by the repository). */
export type NewUser = Omit<User, 'id'>;

/** A link granting a caregiver access to a learner's data. */
export interface CaregiverLink {
  caregiverId: string;
  learnerId: string;
}

/** Data-access for users. Keeps data minimisation in mind — no extra PII. */
export interface UserRepository {
  create(user: NewUser): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  list(): Promise<User[]>;
  /** Hard-delete a user (DPDP right to erasure). Returns true if a row was removed. */
  delete(id: string): Promise<boolean>;
}

/** Data-access for caregiver↔learner links. */
export interface CaregiverLinkRepository {
  link(link: CaregiverLink): Promise<CaregiverLink>;
  unlink(caregiverId: string, learnerId: string): Promise<boolean>;
  exists(caregiverId: string, learnerId: string): Promise<boolean>;
  listForCaregiver(caregiverId: string): Promise<CaregiverLink[]>;
  listForLearner(learnerId: string): Promise<CaregiverLink[]>;
}

/** Data-access for learning progress, keyed by userId + phaseId + itemKey. */
export interface ProgressRepository {
  upsert(record: ProgressRecord): Promise<ProgressRecord>;
  findForUser(userId: string): Promise<ProgressRecord[]>;
  findOne(userId: string, phaseId: string, itemKey: string): Promise<ProgressRecord | null>;
  /** Delete all progress for a user (DPDP right to erasure). Returns rows removed. */
  deleteForUser(userId: string): Promise<number>;
}

/** Injection tokens for the repository abstraction. */
export const USER_REPOSITORY = 'USER_REPOSITORY';
export const CAREGIVER_LINK_REPOSITORY = 'CAREGIVER_LINK_REPOSITORY';
export const PROGRESS_REPOSITORY = 'PROGRESS_REPOSITORY';
