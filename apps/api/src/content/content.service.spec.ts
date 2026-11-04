import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ContentService, isValidPhase } from './content.service';

describe('ContentService', () => {
  const originalContentRoot = process.env.LHD_CONTENT_ROOT;

  afterEach(() => {
    if (originalContentRoot === undefined) {
      delete process.env.LHD_CONTENT_ROOT;
    } else {
      process.env.LHD_CONTENT_ROOT = originalContentRoot;
    }
  });

  describe('loading the real curriculum content', () => {
    let service: ContentService;

    beforeEach(() => {
      // Resolve the repo content root without an override so we exercise the
      // same walk-up logic the app uses at runtime.
      delete process.env.LHD_CONTENT_ROOT;
      service = new ContentService();
      service.onModuleInit();
    });

    it('loads all 13 catalog entries', () => {
      expect(service.getCatalogEntries()).toHaveLength(13);
    });

    it('resolves phase-01 by id and by slug to the same phase', () => {
      const byId = service.getPhase('phase-01');
      const bySlug = service.getPhase('0-3-years');

      expect(byId).not.toBeNull();
      expect(byId?.id).toBe('phase-01');
      expect(bySlug).not.toBeNull();
      expect(bySlug?.id).toBe('phase-01');
      expect(bySlug).toBe(byId);
    });

    it('returns null for an unknown id or slug', () => {
      expect(service.getPhase('phase-99')).toBeNull();
      expect(service.getPhase('not-a-slug')).toBeNull();
    });
  });

  describe('defensive loading from a temp content root', () => {
    let tempRoot: string;

    beforeEach(() => {
      tempRoot = mkdtempSync(join(tmpdir(), 'lhd-content-'));
    });

    afterEach(() => {
      rmSync(tempRoot, { recursive: true, force: true });
    });

    function writePhaseFile(relativeFile: string, contents: unknown): void {
      const full = join(tempRoot, relativeFile);
      mkdirSync(join(full, '..'), { recursive: true });
      writeFileSync(full, JSON.stringify(contents), 'utf8');
    }

    function validPhase(id: string, slug: string, order: number) {
      return {
        id,
        slug,
        order,
        title: `Phase ${id}`,
        ageRange: { label: '0–3', startYears: 0, endYears: 3 },
        primaryObjective: 'objective',
        summary: 'summary',
        developmentDomains: [],
        yearPlans: [],
        milestones: [],
        safety: [],
        outcomes: [],
        projects: [],
        appFeatures: [],
        sources: [],
      };
    }

    it('skips a malformed phase but keeps the catalog entry and loads the good ones', () => {
      writeFileSync(
        join(tempRoot, 'catalog.json'),
        JSON.stringify({
          title: 'temp',
          phases: [
            { id: 'phase-01', order: 1, slug: '0-3-years', title: 'A', ageLabel: '0–3', primaryObjective: 'o', file: 'phases/phase-01/phase.json' },
            { id: 'phase-02', order: 2, slug: '3-6-years', title: 'B', ageLabel: '3–6', primaryObjective: 'o', file: 'phases/phase-02/phase.json' },
            { id: 'phase-03', order: 3, slug: '6-10-years', title: 'C', ageLabel: '6–10', primaryObjective: 'o', file: 'phases/phase-03/phase.json' },
          ],
        }),
        'utf8',
      );

      writePhaseFile('phases/phase-01/phase.json', validPhase('phase-01', '0-3-years', 1));
      // phase-02 is malformed: missing required arrays and primaryObjective.
      writePhaseFile('phases/phase-02/phase.json', { id: 'phase-02', slug: '3-6-years', order: 2 });
      // phase-03 file is absent on disk (unauthored).

      process.env.LHD_CONTENT_ROOT = tempRoot;
      const service = new ContentService();
      service.onModuleInit();

      // Catalog still lists all three entries.
      expect(service.getCatalogEntries()).toHaveLength(3);
      // Only the valid phase is served.
      expect(service.getPhase('phase-01')?.id).toBe('phase-01');
      expect(service.getPhase('phase-02')).toBeNull();
      expect(service.getPhase('phase-03')).toBeNull();
    });

    it('skips a phase whose id disagrees with its catalog entry', () => {
      writeFileSync(
        join(tempRoot, 'catalog.json'),
        JSON.stringify({
          title: 'temp',
          phases: [
            { id: 'phase-01', order: 1, slug: '0-3-years', title: 'A', ageLabel: '0–3', primaryObjective: 'o', file: 'phases/phase-01/phase.json' },
          ],
        }),
        'utf8',
      );
      // File declares a different id than the catalog entry.
      writePhaseFile('phases/phase-01/phase.json', validPhase('phase-99', '0-3-years', 1));

      process.env.LHD_CONTENT_ROOT = tempRoot;
      const service = new ContentService();
      service.onModuleInit();

      expect(service.getCatalogEntries()).toHaveLength(1);
      expect(service.getPhase('phase-01')).toBeNull();
    });
  });

  describe('isValidPhase helper', () => {
    it('accepts a structurally complete phase', () => {
      const phase = {
        id: 'phase-01',
        slug: '0-3-years',
        order: 1,
        title: 'Foundations',
        ageRange: { label: '0–3', startYears: 0, endYears: 3 },
        primaryObjective: 'o',
        summary: 's',
        developmentDomains: [],
        yearPlans: [],
        milestones: [],
        safety: [],
        outcomes: [],
        projects: [],
        appFeatures: [],
        sources: [],
      };
      expect(isValidPhase(phase)).toBe(true);
    });

    it('rejects a phase missing required keys', () => {
      expect(isValidPhase({ id: 'phase-01', slug: '0-3-years', order: 1 })).toBe(false);
      expect(isValidPhase(null)).toBe(false);
      expect(isValidPhase('nope')).toBe(false);
    });
  });
});
