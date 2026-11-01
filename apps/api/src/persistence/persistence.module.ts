import { Global, Module, Provider } from '@nestjs/common';
import { hasDatabaseUrl } from '../config/env';
import {
  CAREGIVER_LINK_REPOSITORY,
  PROGRESS_REPOSITORY,
  USER_REPOSITORY,
} from './repositories';
import { InMemoryUserRepository } from './in-memory/in-memory-user.repository';
import { InMemoryCaregiverLinkRepository } from './in-memory/in-memory-caregiver-link.repository';
import { InMemoryProgressRepository } from './in-memory/in-memory-progress.repository';
import { PrismaService } from './prisma/prisma.service';
import { PrismaUserRepository } from './prisma/prisma-user.repository';
import { PrismaCaregiverLinkRepository } from './prisma/prisma-caregiver-link.repository';
import { PrismaProgressRepository } from './prisma/prisma-progress.repository';

/**
 * Wires the repository abstraction.
 *
 * In-memory implementations are the default (used in tests and whenever
 * DATABASE_URL is unset). The Prisma/Postgres implementations are selected only
 * when a database is configured, so build and tests never require a live DB.
 * The choice is made once, at module construction, from the environment.
 */
const useDatabase = hasDatabaseUrl();

const repositoryProviders: Provider[] = useDatabase
  ? [
      PrismaService,
      { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
      { provide: CAREGIVER_LINK_REPOSITORY, useClass: PrismaCaregiverLinkRepository },
      { provide: PROGRESS_REPOSITORY, useClass: PrismaProgressRepository },
    ]
  : [
      { provide: USER_REPOSITORY, useClass: InMemoryUserRepository },
      { provide: CAREGIVER_LINK_REPOSITORY, useClass: InMemoryCaregiverLinkRepository },
      { provide: PROGRESS_REPOSITORY, useClass: InMemoryProgressRepository },
    ];

@Global()
@Module({
  providers: repositoryProviders,
  exports: [USER_REPOSITORY, CAREGIVER_LINK_REPOSITORY, PROGRESS_REPOSITORY],
})
export class PersistenceModule {}
