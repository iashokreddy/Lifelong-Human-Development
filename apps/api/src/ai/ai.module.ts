import { Module } from '@nestjs/common';
import { ContentModule } from '../content/content.module';
import { AuthModule } from '../auth/auth.module';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { Retriever } from './retriever';
import { LLM_PROVIDER } from './llm-provider.interface';
import { StubLlmProvider } from './stub-llm.provider';

/**
 * AI module: the curriculum-grounded assistant.
 *
 * Imports ContentModule to reuse the loaded phases (the retriever indexes them)
 * and AuthModule so JwtAuthGuard can protect the endpoint. The LLM_PROVIDER token
 * is bound to the deterministic StubLlmProvider by default so builds/tests need
 * no network or API keys; a real provider can be dropped in by swapping this
 * binding.
 */
@Module({
  imports: [ContentModule, AuthModule],
  controllers: [AiController],
  providers: [
    Retriever,
    AiService,
    { provide: LLM_PROVIDER, useClass: StubLlmProvider },
  ],
  exports: [AiService],
})
export class AiModule {}
