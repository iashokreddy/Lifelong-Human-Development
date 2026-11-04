import { NotFoundException } from '@nestjs/common';
import { CatalogEntry, Phase } from '../shared/contract';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';

describe('ContentController', () => {
  const entries: CatalogEntry[] = [
    {
      id: 'phase-01',
      order: 1,
      slug: '0-3-years',
      title: 'Foundations (0–3 years)',
      ageLabel: '0–3',
      primaryObjective: 'Attachment, safety, sensory exploration',
      file: 'phases/phase-01/phase.json',
    },
  ];

  const phase01 = { id: 'phase-01', slug: '0-3-years' } as Phase;

  function makeController(getPhaseResult: Phase | null): ContentController {
    const service = {
      getCatalogEntries: jest.fn().mockReturnValue(entries),
      getPhase: jest.fn().mockReturnValue(getPhaseResult),
    } as unknown as ContentService;
    return new ContentController(service);
  }

  it('GET /phases returns the catalog entries', () => {
    const controller = makeController(phase01);
    expect(controller.getPhases()).toBe(entries);
  });

  it('GET /phases/:idOrSlug returns the matching phase', () => {
    const controller = makeController(phase01);
    expect(controller.getPhase('phase-01')).toBe(phase01);
  });

  it('GET /phases/:idOrSlug throws NotFoundException for an unknown id', () => {
    const controller = makeController(null);
    expect(() => controller.getPhase('phase-99')).toThrow(NotFoundException);
  });
});
