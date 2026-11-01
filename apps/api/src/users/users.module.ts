import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CaregiverAccessService } from './caregiver-access.service';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { DataRightsController } from './data-rights.controller';

/**
 * Users module.
 *
 * Owns the single CaregiverAccessService choke point and exports it so the
 * progress module can authorise through the very same rule. Relies on the
 * global PersistenceModule for repositories and on AuthModule for the guards
 * used by its controllers.
 */
@Module({
  imports: [AuthModule],
  controllers: [UsersController, DataRightsController],
  providers: [UsersService, CaregiverAccessService],
  exports: [CaregiverAccessService, UsersService],
})
export class UsersModule {}
