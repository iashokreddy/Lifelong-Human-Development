import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { CatalogEntry, Phase } from '../shared/contract';
import { ContentService } from './content.service';

/**
 * Read-only curriculum endpoints (under the global 'api' prefix).
 *
 * GET /api/phases            -> the catalog entries
 * GET /api/phases/:idOrSlug  -> a single phase by id or slug (404 if unknown)
 */
@Controller('phases')
export class ContentController {
  constructor(private readonly content: ContentService) {}

  @Get()
  getPhases(): CatalogEntry[] {
    return this.content.getCatalogEntries();
  }

  @Get(':idOrSlug')
  getPhase(@Param('idOrSlug') idOrSlug: string): Phase {
    const phase = this.content.getPhase(idOrSlug);
    if (!phase) {
      throw new NotFoundException(`No phase found for "${idOrSlug}".`);
    }
    return phase;
  }
}
