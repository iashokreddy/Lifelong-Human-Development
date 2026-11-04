import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import type { ProgressRecord } from '../shared/contract';
import { ProgressService } from './progress.service';
import { SetProgressDto } from './dto';

/**
 * Progress endpoints (under the global 'api' prefix).
 *
 * GET /api/progress/:userId -> the subject's progress records
 * PUT /api/progress/:userId -> set the status of one curriculum item
 *
 * All routes require a valid JWT. The authenticated user is passed as the actor
 * so ProgressService can authorise through the shared CaregiverAccessService.
 */
@Controller('progress')
@UseGuards(JwtAuthGuard)
export class ProgressController {
  constructor(private readonly progress: ProgressService) {}

  @Get(':userId')
  getProgress(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('userId') userId: string,
  ): Promise<ProgressRecord[]> {
    return this.progress.getProgress(actor, userId);
  }

  @Put(':userId')
  setProgress(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('userId') userId: string,
    @Body() dto: SetProgressDto,
  ): Promise<ProgressRecord> {
    return this.progress.setProgress(actor, userId, dto);
  }
}
