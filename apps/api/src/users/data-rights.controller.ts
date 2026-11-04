import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import { UsersService, type DataExportBundle } from './users.service';

/**
 * DPDP (India Digital Personal Data Protection Rules, 2025) data-rights endpoints.
 *
 * These implement the data principal's right to portability (export) and erasure
 * (delete). Both are authorised inside UsersService through the single
 * CaregiverAccessService choke point — permitted for self, a linked caregiver,
 * or an admin. In line with DPDP principles the platform minimises stored data,
 * keeps it exportable and deletable, and performs no behavioural ad profiling.
 */
@Controller('users')
@UseGuards(JwtAuthGuard)
export class DataRightsController {
  constructor(private readonly users: UsersService) {}

  /** Export the user's profile and progress as a downloadable JSON bundle. */
  @Get(':id/export')
  exportData(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<DataExportBundle> {
    return this.users.exportData(actor, id);
  }

  /** Erase the user, their caregiver links, and their progress records. */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteData(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<void> {
    await this.users.deleteData(actor, id);
  }
}
