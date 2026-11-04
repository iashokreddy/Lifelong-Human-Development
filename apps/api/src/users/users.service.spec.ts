import { ForbiddenException } from '@nestjs/common';
import { InMemoryUserRepository } from '../persistence/in-memory/in-memory-user.repository';
import { InMemoryCaregiverLinkRepository } from '../persistence/in-memory/in-memory-caregiver-link.repository';
import { InMemoryProgressRepository } from '../persistence/in-memory/in-memory-progress.repository';
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import { CaregiverAccessService } from './caregiver-access.service';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let users: InMemoryUserRepository;
  let links: InMemoryCaregiverLinkRepository;
  let progress: InMemoryProgressRepository;
  let access: CaregiverAccessService;
  let service: UsersService;

  beforeEach(() => {
    users = new InMemoryUserRepository();
    links = new InMemoryCaregiverLinkRepository();
    progress = new InMemoryProgressRepository();
    access = new CaregiverAccessService(links);
    service = new UsersService(users, links, progress, access);
  });

  async function makeUser(role: 'learner' | 'parent' | 'admin') {
    return users.create({
      email: `${role}-${Math.random()}@example.com`,
      passwordHash: 'x',
      displayName: role,
      role,
      isMinor: false,
    });
  }

  it('linkLearner makes canAccess return true for the caregiver', async () => {
    const parent = await makeUser('parent');
    const learner = await makeUser('learner');
    const actor: AuthenticatedUser = { userId: parent.id, role: 'parent' };

    expect(await access.canAccess(parent.id, 'parent', learner.id)).toBe(false);
    await service.linkLearner(actor, learner.id);
    expect(await access.canAccess(parent.id, 'parent', learner.id)).toBe(true);
  });

  it('createMinorAccount requires a caregiver actor', async () => {
    const actor: AuthenticatedUser = { userId: 'learner1', role: 'learner' };
    await expect(
      service.createMinorAccount(actor, { displayName: 'Kid' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('createMinorAccount creates a minor and auto-links it to the caregiver', async () => {
    const parent = await makeUser('parent');
    const actor: AuthenticatedUser = { userId: parent.id, role: 'parent' };

    const minor = await service.createMinorAccount(actor, { displayName: 'Kid' });
    expect(minor.isMinor).toBe(true);
    expect(minor.role).toBe('learner');
    expect(await access.canAccess(parent.id, 'parent', minor.id)).toBe(true);
  });

  it('updateProfile persists displayName for an authorised actor', async () => {
    const learner = await makeUser('learner');
    const actor: AuthenticatedUser = { userId: learner.id, role: 'learner' };

    const updated = await service.updateProfile(actor, learner.id, { displayName: 'New Name' });
    expect(updated.displayName).toBe('New Name');
    const reread = await service.getProfile(actor, learner.id);
    expect(reread.displayName).toBe('New Name');
  });

  it('getProfile denies an unrelated actor', async () => {
    const learner = await makeUser('learner');
    const stranger: AuthenticatedUser = { userId: 'stranger', role: 'learner' };
    await expect(service.getProfile(stranger, learner.id)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('exportData returns profile and progress; deleteData erases them', async () => {
    const learner = await makeUser('learner');
    const actor: AuthenticatedUser = { userId: learner.id, role: 'learner' };
    await progress.upsert({
      userId: learner.id,
      phaseId: 'phase-01',
      itemKey: 'outcome:0',
      status: 'in-progress',
      updatedAt: new Date().toISOString(),
    });

    const bundle = await service.exportData(actor, learner.id);
    expect(bundle.profile.id).toBe(learner.id);
    expect(bundle.progress).toHaveLength(1);

    await service.deleteData(actor, learner.id);
    expect(await users.findById(learner.id)).toBeNull();
    expect(await progress.findForUser(learner.id)).toHaveLength(0);
  });
});
