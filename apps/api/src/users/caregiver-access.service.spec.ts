import { InMemoryCaregiverLinkRepository } from '../persistence/in-memory/in-memory-caregiver-link.repository';
import { CaregiverAccessService } from './caregiver-access.service';

describe('CaregiverAccessService', () => {
  let links: InMemoryCaregiverLinkRepository;
  let service: CaregiverAccessService;

  beforeEach(() => {
    links = new InMemoryCaregiverLinkRepository();
    service = new CaregiverAccessService(links);
  });

  it('allows the subject to access their own data (self)', async () => {
    await expect(service.canAccess('u1', 'learner', 'u1')).resolves.toBe(true);
  });

  it('allows an admin to access any user', async () => {
    await expect(service.canAccess('admin1', 'admin', 'someone-else')).resolves.toBe(
      true,
    );
  });

  it('allows a caregiver linked to the learner', async () => {
    await links.link({ caregiverId: 'parent1', learnerId: 'child1' });
    await expect(service.canAccess('parent1', 'parent', 'child1')).resolves.toBe(true);
  });

  it('denies an unlinked caregiver', async () => {
    await expect(service.canAccess('parent1', 'parent', 'child1')).resolves.toBe(false);
  });

  it('denies an unrelated user', async () => {
    await expect(service.canAccess('stranger', 'learner', 'child1')).resolves.toBe(
      false,
    );
  });
});
