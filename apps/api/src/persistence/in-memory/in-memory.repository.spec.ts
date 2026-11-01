import { InMemoryUserRepository } from './in-memory-user.repository';
import { InMemoryCaregiverLinkRepository } from './in-memory-caregiver-link.repository';
import { InMemoryProgressRepository } from './in-memory-progress.repository';

describe('in-memory repositories', () => {
  describe('InMemoryUserRepository', () => {
    it('creates, finds by id and email (case-insensitive), lists and deletes', async () => {
      const repo = new InMemoryUserRepository();
      const created = await repo.create({
        email: 'Parent@Example.com',
        passwordHash: 'hash',
        role: 'parent',
        isMinor: false,
        displayName: 'A Parent',
      });

      expect(created.id).toBeTruthy();
      expect(await repo.findById(created.id)).toMatchObject({ email: 'Parent@Example.com' });
      expect(await repo.findByEmail('parent@example.com')).not.toBeNull();
      expect(await repo.list()).toHaveLength(1);

      expect(await repo.delete(created.id)).toBe(true);
      expect(await repo.findById(created.id)).toBeNull();
      expect(await repo.delete(created.id)).toBe(false);
    });
  });

  describe('InMemoryCaregiverLinkRepository', () => {
    it('links, reports existence, lists both directions and unlinks', async () => {
      const repo = new InMemoryCaregiverLinkRepository();
      await repo.link({ caregiverId: 'c1', learnerId: 'l1' });

      expect(await repo.exists('c1', 'l1')).toBe(true);
      expect(await repo.exists('c1', 'l2')).toBe(false);
      expect(await repo.listForCaregiver('c1')).toHaveLength(1);
      expect(await repo.listForLearner('l1')).toHaveLength(1);

      expect(await repo.unlink('c1', 'l1')).toBe(true);
      expect(await repo.exists('c1', 'l1')).toBe(false);
    });
  });

  describe('InMemoryProgressRepository', () => {
    it('upserts, finds and deletes per user', async () => {
      const repo = new InMemoryProgressRepository();
      await repo.upsert({
        userId: 'u1',
        phaseId: 'phase-01',
        itemKey: 'outcome:0',
        status: 'in-progress',
        updatedAt: '2025-01-01T00:00:00.000Z',
      });

      const one = await repo.findOne('u1', 'phase-01', 'outcome:0');
      expect(one?.status).toBe('in-progress');

      await repo.upsert({
        userId: 'u1',
        phaseId: 'phase-01',
        itemKey: 'outcome:0',
        status: 'completed',
        updatedAt: '2025-01-02T00:00:00.000Z',
      });
      expect((await repo.findForUser('u1'))[0].status).toBe('completed');
      expect(await repo.findForUser('u1')).toHaveLength(1);

      expect(await repo.deleteForUser('u1')).toBe(1);
      expect(await repo.findForUser('u1')).toHaveLength(0);
    });
  });
});
