import { ForbiddenException } from '@nestjs/common';
import { InMemoryCaregiverLinkRepository } from '../persistence/in-memory/in-memory-caregiver-link.repository';
import { InMemoryProgressRepository } from '../persistence/in-memory/in-memory-progress.repository';
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import { CaregiverAccessService } from '../users/caregiver-access.service';
import { ProgressService } from './progress.service';
import type { SetProgressDto } from './dto';

describe('ProgressService', () => {
  let links: InMemoryCaregiverLinkRepository;
  let repo: InMemoryProgressRepository;
  let access: CaregiverAccessService;
  let service: ProgressService;

  const owner: AuthenticatedUser = { userId: 'learner1', role: 'learner' };
  const caregiver: AuthenticatedUser = { userId: 'parent1', role: 'parent' };
  const stranger: AuthenticatedUser = { userId: 'stranger1', role: 'learner' };

  const item: SetProgressDto = {
    phaseId: 'phase-01',
    itemKey: 'outcome:0',
    status: 'in-progress',
  };

  beforeEach(() => {
    links = new InMemoryCaregiverLinkRepository();
    repo = new InMemoryProgressRepository();
    access = new CaregiverAccessService(links);
    service = new ProgressService(repo, access);
  });

  it('lets the owner write and read their own progress', async () => {
    const written = await service.setProgress(owner, owner.userId, item);
    expect(written.status).toBe('in-progress');

    const read = await service.getProgress(owner, owner.userId);
    expect(read).toHaveLength(1);
    expect(read[0].itemKey).toBe('outcome:0');
  });

  it('lets a caregiver linked to the learner read and write the learner progress', async () => {
    await links.link({ caregiverId: caregiver.userId, learnerId: owner.userId });

    const written = await service.setProgress(caregiver, owner.userId, {
      ...item,
      status: 'completed',
    });
    expect(written.status).toBe('completed');

    const read = await service.getProgress(caregiver, owner.userId);
    expect(read).toHaveLength(1);
    expect(read[0].status).toBe('completed');
  });

  it('denies an unrelated actor on read', async () => {
    await expect(service.getProgress(stranger, owner.userId)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('denies an unrelated actor on write', async () => {
    await expect(
      service.setProgress(stranger, owner.userId, item),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
