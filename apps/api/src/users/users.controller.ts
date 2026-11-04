import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import { UsersService, type PublicProfile } from './users.service';
import { CreateMinorDto, LinkLearnerDto, UpdateProfileDto } from './dto';

/**
 * User profile and caregiver-link endpoints (under the global 'api' prefix).
 *
 * All routes require a valid JWT. Any route that targets another user's data is
 * authorised inside UsersService through CaregiverAccessService — the single
 * enforcement point — so there are no ad-hoc ownership checks here.
 */
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  /** Link the current caregiver to a learner. */
  @Post('links')
  @Roles('parent', 'guardian', 'educator', 'admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  async linkLearner(
    @CurrentUser() actor: AuthenticatedUser,
    @Body() dto: LinkLearnerDto,
  ): Promise<void> {
    await this.users.linkLearner(actor, dto.learnerId);
  }

  /** Remove a caregiver↔learner link. */
  @Delete('links/:learnerId')
  @Roles('parent', 'guardian', 'educator', 'admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  async unlinkLearner(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('learnerId') learnerId: string,
  ): Promise<void> {
    await this.users.unlinkLearner(actor, learnerId);
  }

  /** Create a caregiver-mediated minor account, auto-linked to the caregiver. */
  @Post('minors')
  @Roles('parent', 'guardian', 'educator', 'admin')
  createMinor(
    @CurrentUser() actor: AuthenticatedUser,
    @Body() dto: CreateMinorDto,
  ): Promise<PublicProfile> {
    return this.users.createMinorAccount(actor, dto);
  }

  @Get(':id')
  getProfile(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<PublicProfile> {
    return this.users.getProfile(actor, id);
  }

  @Patch(':id')
  updateProfile(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateProfileDto,
  ): Promise<PublicProfile> {
    return this.users.updateProfile(actor, id, dto);
  }
}
