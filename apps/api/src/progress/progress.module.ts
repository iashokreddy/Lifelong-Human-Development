import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { ProgressService } from './progress.service';
import { ProgressController } from './progress.controller';

/**
 * Progress module.
 *
 * Imports UsersModule to reuse the single CaregiverAccessService choke point for
 * authorisation, and AuthModule for the JWT guard on its controller. Repositories
 * come from the global PersistenceModule.
 */
@Module({
  imports: [AuthModule, UsersModule],
  controllers: [ProgressController],
  providers: [ProgressService],
  exports: [ProgressService],
})
export class ProgressModule {}
