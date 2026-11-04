import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AiService, type AskResult } from './ai.service';
import { AskDto } from './dto';

/**
 * AI assistant endpoint (under the global 'api' prefix).
 *
 * POST /api/ai/ask -> ask a curriculum question.
 *
 * Requires a valid JWT. The assistant only answers from the vetted curriculum
 * and routes health/safety/wellbeing questions to human/professional help.
 */
@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly ai: AiService) {}

  @Post('ask')
  ask(@Body() dto: AskDto): AskResult {
    return this.ai.ask(dto.question);
  }
}
