import { Module } from '@nestjs/common';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';

/**
 * Content module: loads and serves the curriculum phases.
 *
 * Exports ContentService so other modules (e.g. AiModule) can reuse the loaded
 * catalog and phases without re-reading the filesystem.
 */
@Module({
  controllers: [ContentController],
  providers: [ContentService],
  exports: [ContentService],
})
export class ContentModule {}
